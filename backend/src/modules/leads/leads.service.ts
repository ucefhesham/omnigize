import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateLeadDto, UpdateLeadDto, LeadFilterDto } from './dto/lead.dto';
import { insertLeadSchema } from '../../db/zod';
import { leads } from '../../db/schema';
import { eq, and, isNull, ilike, or, desc, SQL } from 'drizzle-orm';

@Injectable()
export class LeadsService {
  constructor(private dbService: DatabaseService) {}

  async create(workspaceId: string, createLeadDto: CreateLeadDto, userId: string) {
    // Validate inputs using our custom strict Zod override schema
    const newLeadData = insertLeadSchema.parse({
      ...createLeadDto,
      workspaceId,
      ownerId: userId,
      metadata: createLeadDto.metadata || {},
      tags: createLeadDto.tags || [],
    });

    const [lead] = await this.dbService.db
      .insert(leads)
      .values(newLeadData)
      .returning();

    return lead;
  }

  async findAll(workspaceId: string, filter?: LeadFilterDto) {
    const conditions: (SQL | undefined)[] = [
      eq(leads.workspaceId, workspaceId),
      isNull(leads.deletedAt),
    ];

    if (filter?.search) {
      conditions.push(
        or(
          ilike(leads.firstName, `%${filter.search}%`),
          ilike(leads.lastName, `%${filter.search}%`),
          ilike(leads.email, `%${filter.search}%`),
          ilike(leads.companyName, `%${filter.search}%`)
        )
      );
    }

    if (filter?.ownerId) {
      conditions.push(eq(leads.ownerId, filter.ownerId));
    }

    return this.dbService.db.query.leads.findMany({
      where: and(...(conditions as any[])),
      with: {
        owner: {
          columns: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
      orderBy: [desc(leads.createdAt)],
      limit: filter?.limit || 50,
      offset: filter?.offset || 0,
    });
  }

  async findOne(id: string, workspaceId: string) {
    const lead = await this.dbService.db.query.leads.findFirst({
      where: and(
        eq(leads.id, id),
        eq(leads.workspaceId, workspaceId),
        isNull(leads.deletedAt)
      ),
      with: {
        owner: {
          columns: { id: true, firstName: true, lastName: true, avatar: true },
        },
        deals: {
          orderBy: (deals, { desc }) => [desc(deals.createdAt)],
          limit: 5,
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

    // Filter undefined keys and validate using Zod metadata override silently via insert schema partial
    const updatePayload = {
      firstName: updateLeadDto.firstName,
      lastName: updateLeadDto.lastName,
      email: updateLeadDto.email,
      phone: updateLeadDto.phone,
      companyName: updateLeadDto.companyName,
      sourceChannel: updateLeadDto.sourceChannel,
      metadata: updateLeadDto.metadata,
      tags: updateLeadDto.tags,
    };

    const [updatedLead] = await this.dbService.db
      .update(leads)
      .set(updatePayload)
      .where(eq(leads.id, id))
      .returning();

    return updatedLead;
  }

  async remove(id: string, workspaceId: string) {
    await this.findOne(id, workspaceId);

    const [deletedLead] = await this.dbService.db
      .update(leads)
      .set({ deletedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();

    return deletedLead;
  }

  async getCount(workspaceId: string): Promise<number> {
    const result = await this.dbService.db
      .select({ count: leads.id })
      .from(leads)
      .where(
        and(eq(leads.workspaceId, workspaceId), isNull(leads.deletedAt))
      );
    return result.length;
  }

  async getStatistics(workspaceId: string) {
    const total = await this.getCount(workspaceId);
    return { total };
  }
}

