import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './dto/workspace.dto';

@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createWorkspaceDto: CreateWorkspaceDto) {
    const workspace = await this.prisma.workspace.create({
      data: {
        name: createWorkspaceDto.name,
        slug: createWorkspaceDto.slug || createWorkspaceDto.name.toLowerCase().replace(/\s+/g, '-'),
        domain: createWorkspaceDto.domain,
        industry: createWorkspaceDto.industry || 'General',
        logo: createWorkspaceDto.logo,
        settings: createWorkspaceDto.settings || {},
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        workspaceId: workspace.id,
        isWorkspaceOwner: true,
      },
    });

    await this.prisma.role.create({
      data: {
        workspaceId: workspace.id,
        name: 'Admin',
        description: 'Workspace Administrator',
        isSystemRole: true,
      },
    });

    await this.prisma.role.create({
      data: {
        workspaceId: workspace.id,
        name: 'Manager',
        description: 'Workspace Manager',
        isSystemRole: true,
      },
    });

    await this.prisma.role.create({
      data: {
        workspaceId: workspace.id,
        name: 'User',
        description: 'Workspace User',
        isSystemRole: true,
      },
    });

    return workspace;
  }

  async findAll(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { workspace: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const workspaces = await this.prisma.workspace.findMany({
      where: {
        users: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        quotas: true,
        _count: {
          select: {
            users: true,
            contacts: true,
            leads: true,
            deals: true,
          },
        },
      },
    });

    return workspaces;
  }

  async findOne(id: string, userId: string) {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id,
        users: {
          some: { id: userId },
        },
      },
      include: {
        quotas: true,
        departments: true,
        teams: true,
        _count: {
          select: {
            users: true,
            contacts: true,
            leads: true,
            deals: true,
            properties: true,
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return workspace;
  }

  async update(id: string, userId: string, updateWorkspaceDto: UpdateWorkspaceDto) {
    await this.findOne(id, userId);

    if (updateWorkspaceDto.slug) {
      const existing = await this.prisma.workspace.findFirst({
        where: {
          slug: updateWorkspaceDto.slug,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('Slug already exists');
      }
    }

    return this.prisma.workspace.update({
      where: { id },
      data: updateWorkspaceDto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.workspaceId !== id) {
      throw new NotFoundException('You can only delete your own workspace');
    }

    return this.prisma.workspace.delete({
      where: { id },
    });
  }

  async getStatistics(id: string, userId: string) {
    const workspace = await this.findOne(id, userId);

    const [contactsCount, leadsCount, dealsCount, propertiesCount, usersCount] = await Promise.all([
      this.prisma.contact.count({ where: { workspaceId: id } }),
      this.prisma.lead.count({ where: { workspaceId: id } }),
      this.prisma.deal.count({ where: { workspaceId: id } }),
      this.prisma.property.count({ where: { workspaceId: id } }),
      this.prisma.user.count({ where: { workspaceId: id } }),
    ]);

    return {
      ...workspace,
      statistics: {
        contacts: contactsCount,
        leads: leadsCount,
        deals: dealsCount,
        properties: propertiesCount,
        users: usersCount,
      },
    };
  }
}
