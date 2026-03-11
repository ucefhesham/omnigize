import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLeadDto, UpdateLeadDto, LeadFilterDto } from './dto/lead.dto';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async create(workspaceId: string, createLeadDto: CreateLeadDto, userId: string) {
    return this.prisma.lead.create({
      data: {
        workspaceId,
        ownerId: userId,
        firstName: createLeadDto.firstName,
        lastName: createLeadDto.lastName,
        email: createLeadDto.email,
        phone: createLeadDto.phone,
        companyName: createLeadDto.companyName,
        sourceChannel: createLeadDto.sourceChannel,
        metadata: createLeadDto.metadata || {},
        tags: createLeadDto.tags || [],
      },
    });
  }

  async findAll(workspaceId: string, filter?: LeadFilterDto) {
    const where: any = { workspaceId };

    if (filter?.search) {
      where.OR = [
        { firstName: { contains: filter.search, mode: 'insensitive' } },
        { lastName: { contains: filter.search, mode: 'insensitive' } },
        { email: { contains: filter.search, mode: 'insensitive' } },
        { companyName: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    if (filter?.ownerId) {
      where.ownerId = filter.ownerId;
    }

    return this.prisma.lead.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filter?.limit || 50,
      skip: filter?.offset || 0,
    });
  }

  async findOne(id: string, workspaceId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, workspaceId },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        deals: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return lead;
  }

  async update(id: string, workspaceId: string, updateLeadDto: UpdateLeadDto) {
    await this.findOne(id, workspaceId);

    return this.prisma.lead.update({
      where: { id },
      data: {
        firstName: updateLeadDto.firstName,
        lastName: updateLeadDto.lastName,
        email: updateLeadDto.email,
        phone: updateLeadDto.phone,
        companyName: updateLeadDto.companyName,
        sourceChannel: updateLeadDto.sourceChannel,
        metadata: updateLeadDto.metadata,
        tags: updateLeadDto.tags,
      },
    });
  }

  async remove(id: string, workspaceId: string) {
    await this.findOne(id, workspaceId);

    return this.prisma.lead.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getCount(workspaceId: string): Promise<number> {
    return this.prisma.lead.count({ where: { workspaceId } });
  }

  async getStatistics(workspaceId: string) {
    const total = await this.prisma.lead.count({ where: { workspaceId } });

    return { total };
  }
}
