import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDealDto, UpdateDealDto, DealFilterDto } from './dto/deal.dto';

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}

  async create(
    workspaceId: string,
    createDealDto: CreateDealDto,
    userId: string,
  ) {
    return this.prisma.deal.create({
      data: {
        workspaceId,
        ownerId: userId,
        leadId: createDealDto.leadId,
        title: createDealDto.name,
        value: createDealDto.value || 0,
        currency: createDealDto.currency || 'USD',
        probability: createDealDto.probability || 50,
        expectedCloseDate: createDealDto.expectedCloseDate
          ? new Date(createDealDto.expectedCloseDate)
          : undefined,
        metadata: createDealDto.metadata || {},
        tags: createDealDto.tags || [],
      },
    });
  }

  async findAll(workspaceId: string, filter?: DealFilterDto) {
    const where: any = { workspaceId };

    if (filter?.search) {
      where.OR = [{ title: { contains: filter.search, mode: 'insensitive' } }];
    }

    if (filter?.ownerId) {
      where.ownerId = filter.ownerId;
    }

    if (filter?.leadId) {
      where.leadId = filter.leadId;
    }

    return this.prisma.deal.findMany({
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
        lead: true,
      },
      orderBy: { createdAt: 'desc' },
      take: filter?.limit || 50,
      skip: filter?.offset || 0,
    });
  }

  async findOne(id: string, workspaceId: string) {
    const deal = await this.prisma.deal.findFirst({
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
        lead: true,
      },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    return deal;
  }

  async update(id: string, workspaceId: string, updateDealDto: UpdateDealDto) {
    await this.findOne(id, workspaceId);

    return this.prisma.deal.update({
      where: { id },
      data: {
        title: updateDealDto.name,
        value: updateDealDto.value,
        currency: updateDealDto.currency,
        probability: updateDealDto.probability,
        expectedCloseDate: updateDealDto.expectedCloseDate
          ? new Date(updateDealDto.expectedCloseDate)
          : undefined,
        actualCloseDate: updateDealDto.actualCloseDate
          ? new Date(updateDealDto.actualCloseDate)
          : undefined,
        metadata: updateDealDto.metadata,
        tags: updateDealDto.tags,
      },
    });
  }

  async remove(id: string, workspaceId: string) {
    await this.findOne(id, workspaceId);

    return this.prisma.deal.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getCount(workspaceId: string): Promise<number> {
    return this.prisma.deal.count({ where: { workspaceId } });
  }

  async getStatistics(workspaceId: string) {
    const deals = await this.prisma.deal.findMany({
      where: { workspaceId },
      select: { value: true },
    });

    const total = deals.length;
    const totalValue = deals.reduce((sum, d) => sum + Number(d.value || 0), 0);

    return { total, totalValue };
  }
}
