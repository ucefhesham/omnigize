import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateDealDto, UpdateDealDto, DealFilterDto } from './dto/deal.dto';
import { insertDealSchema } from '../../db/zod';
import { deals } from '../../db/schema';
import { eq, and, isNull, ilike, desc, SQL } from 'drizzle-orm';

@Injectable()
export class DealsService {
  constructor(private dbService: DatabaseService) {}

  async create(workspaceId: string, createDealDto: CreateDealDto, userId: string) {
    const newDealData = insertDealSchema.parse({
      workspaceId,
      ownerId: userId,
      leadId: createDealDto.leadId,
      title: createDealDto.name,
      value: createDealDto.value ? String(createDealDto.value) : '0',
      currency: createDealDto.currency || 'USD',
      probability: createDealDto.probability || 50,
      expectedCloseDate: createDealDto.expectedCloseDate
        ? new Date(createDealDto.expectedCloseDate).toISOString()
        : undefined,
      metadata: createDealDto.metadata || {},
      tags: createDealDto.tags || [],
    });

    const [deal] = await this.dbService.db
      .insert(deals)
      .values(newDealData)
      .returning();

    return deal;
  }

  async findAll(workspaceId: string, filter?: DealFilterDto) {
    const conditions: (SQL | undefined)[] = [
      eq(deals.workspaceId, workspaceId),
      isNull(deals.deletedAt),
    ];

    if (filter?.search) {
      conditions.push(ilike(deals.title, `%${filter.search}%`));
    }
    if (filter?.ownerId) {
      conditions.push(eq(deals.ownerId, filter.ownerId));
    }
    if (filter?.leadId) {
      conditions.push(eq(deals.leadId, filter.leadId));
    }

    return this.dbService.db.query.deals.findMany({
      where: and(...conditions),
      with: {
        owner: {
          columns: { id: true, firstName: true, lastName: true, avatar: true },
        },
        lead: true,
      },
      orderBy: [desc(deals.createdAt)],
      limit: filter?.limit || 50,
      offset: filter?.offset || 0,
    });
  }

  async findOne(id: string, workspaceId: string) {
    const deal = await this.dbService.db.query.deals.findFirst({
      where: and(
        eq(deals.id, id),
        eq(deals.workspaceId, workspaceId),
        isNull(deals.deletedAt)
      ),
      with: {
        owner: {
          columns: { id: true, firstName: true, lastName: true, avatar: true },
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

    const updatePayload = {
      title: updateDealDto.name,
      value: updateDealDto.value !== undefined ? String(updateDealDto.value) : undefined,
      currency: updateDealDto.currency,
      probability: updateDealDto.probability,
      expectedCloseDate: updateDealDto.expectedCloseDate
        ? new Date(updateDealDto.expectedCloseDate).toISOString()
        : undefined,
      actualCloseDate: updateDealDto.actualCloseDate
        ? new Date(updateDealDto.actualCloseDate).toISOString()
        : undefined,
      metadata: updateDealDto.metadata,
      tags: updateDealDto.tags,
    };

    const [updatedDeal] = await this.dbService.db
      .update(deals)
      .set(updatePayload)
      .where(eq(deals.id, id))
      .returning();

    return updatedDeal;
  }

  async remove(id: string, workspaceId: string) {
    await this.findOne(id, workspaceId);

    const [deletedDeal] = await this.dbService.db
      .update(deals)
      .set({ deletedAt: new Date() })
      .where(eq(deals.id, id))
      .returning();

    return deletedDeal;
  }

  async getCount(workspaceId: string): Promise<number> {
    const result = await this.dbService.db
      .select({ count: deals.id })
      .from(deals)
      .where(and(eq(deals.workspaceId, workspaceId), isNull(deals.deletedAt)));
      
    return result.length;
  }

  async getStatistics(workspaceId: string) {
    const allDeals = await this.dbService.db
      .select({ value: deals.value })
      .from(deals)
      .where(and(eq(deals.workspaceId, workspaceId), isNull(deals.deletedAt)));

    const total = allDeals.length;
    const totalValue = allDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);

    return { total, totalValue };
  }
}
