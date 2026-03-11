import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './dto/workspace.dto';
import { workspaces, roles, users, contacts, leads, deals, properties } from '../../db/schema';
import { eq, and, isNull, not } from 'drizzle-orm';

@Injectable()
export class WorkspacesService {
  constructor(private dbService: DatabaseService) {}

  async create(userId: string, createWorkspaceDto: CreateWorkspaceDto) {
    // Wrap workspace creation and initial role scaffolding in a transaction
    return this.dbService.globalDb.transaction(async (tx) => {
      const slugInput = createWorkspaceDto.slug || createWorkspaceDto.name.toLowerCase().replace(/\s+/g, '-');

      const [workspace] = await tx
        .insert(workspaces)
        .values({
          name: createWorkspaceDto.name,
          slug: slugInput,
          domain: createWorkspaceDto.domain,
          industry: createWorkspaceDto.industry || 'General',
          logo: createWorkspaceDto.logo,
          settings: createWorkspaceDto.settings || {},
        })
        .returning();

      await tx
        .update(users)
        .set({
          workspaceId: workspace.id,
          isWorkspaceOwner: true,
        })
        .where(eq(users.id, userId));

      await tx.insert(roles).values([
        {
          workspaceId: workspace.id,
          name: 'Admin',
          description: 'Workspace Administrator',
          isSystemRole: true,
        },
        {
          workspaceId: workspace.id,
          name: 'Manager',
          description: 'Workspace Manager',
          isSystemRole: true,
        },
        {
          workspaceId: workspace.id,
          name: 'User',
          description: 'Workspace User',
          isSystemRole: true,
        },
      ]);

      return workspace;
    });
  }

  async findAll(userId: string) {
    const user = await this.dbService.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const workspaceId = user.workspaceId;

    const workspaceData = await this.dbService.db.query.workspaces.findFirst({
      where: eq(workspaces.id, workspaceId),
      with: { quotas: true },
    });

    if (!workspaceData) return [];

    const stats = await this.getStatistics(workspaceId, userId);

    return [{
      ...workspaceData,
      _count: stats.statistics,
    }];
  }

  async findOne(id: string, userId: string) {
    const user = await this.dbService.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user || user.workspaceId !== id) {
      throw new NotFoundException('Workspace not found or unauthorized');
    }

    const workspace = await this.dbService.db.query.workspaces.findFirst({
      where: and(eq(workspaces.id, id), eq(workspaces.isActive, true)),
      with: {
        quotas: true,
        departments: true,
        teams: true,
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const stats = await this.getStatistics(id, userId);

    return {
      ...workspace,
      _count: stats.statistics,
    };
  }

  async update(id: string, userId: string, updateWorkspaceDto: UpdateWorkspaceDto) {
    await this.findOne(id, userId);

    if (updateWorkspaceDto.slug) {
      const existing = await this.dbService.db.query.workspaces.findFirst({
        where: and(
          eq(workspaces.slug, updateWorkspaceDto.slug),
          not(eq(workspaces.id, id))
        ),
      });

      if (existing) {
        throw new ConflictException('Slug already exists');
      }
    }

    const [updatedWorkspace] = await this.dbService.db
      .update(workspaces)
      .set({
        name: updateWorkspaceDto.name,
        slug: updateWorkspaceDto.slug,
        domain: updateWorkspaceDto.domain,
        industry: updateWorkspaceDto.industry,
        logo: updateWorkspaceDto.logo,
        settings: updateWorkspaceDto.settings,
        updatedAt: new Date(),
      })
      .where(eq(workspaces.id, id))
      .returning();

    return updatedWorkspace;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    const user = await this.dbService.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user?.isWorkspaceOwner || user.workspaceId !== id) {
      throw new ForbiddenException('Only the workspace owner can delete this workspace');
    }

    const [deletedWorkspace] = await this.dbService.db
      .update(workspaces)
      .set({ isActive: false })
      .where(eq(workspaces.id, id))
      .returning();

    return deletedWorkspace;
  }

  async getStatistics(id: string, userId: string) {
    const [c, l, d, p, u] = await Promise.all([
      this.dbService.db.select({ id: contacts.id }).from(contacts).where(and(eq(contacts.workspaceId, id), isNull(contacts.deletedAt))),
      this.dbService.db.select({ id: leads.id }).from(leads).where(and(eq(leads.workspaceId, id), isNull(leads.deletedAt))),
      this.dbService.db.select({ id: deals.id }).from(deals).where(and(eq(deals.workspaceId, id), isNull(deals.deletedAt))),
      this.dbService.db.select({ id: properties.id }).from(properties).where(and(eq(properties.workspaceId, id), isNull(properties.deletedAt))),
      this.dbService.db.select({ id: users.id }).from(users).where(and(eq(users.workspaceId, id), isNull(users.deletedAt))),
    ]);

    return {
      statistics: {
        contacts: c.length,
        leads: l.length,
        deals: d.length,
        properties: p.length,
        users: u.length,
      },
    };
  }
}
