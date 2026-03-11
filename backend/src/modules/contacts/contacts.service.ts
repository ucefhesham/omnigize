import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateContactDto, UpdateContactDto, ContactFilterDto } from './dto/contact.dto';
import { insertContactSchema } from '../../db/zod';
import { contacts } from '../../db/schema';
import { eq, and, isNull, ilike, or, desc, sql, SQL } from 'drizzle-orm';

@Injectable()
export class ContactsService {
  constructor(private dbService: DatabaseService) {}

  async create(workspaceId: string, createContactDto: CreateContactDto, userId: string) {
    const newContactData = insertContactSchema.parse({
      workspaceId,
      ownerId: userId,
      firstName: createContactDto.firstName,
      lastName: createContactDto.lastName,
      email: createContactDto.email,
      phone: createContactDto.phone,
      companyName: createContactDto.companyName,
      sourceChannel: createContactDto.sourceChannel,
      metadata: createContactDto.metadata || {},
      tags: createContactDto.tags || [],
    });

    const [contact] = await this.dbService.db
      .insert(contacts)
      .values(newContactData)
      .returning();

    return contact;
  }

  async findAll(workspaceId: string, filter?: ContactFilterDto) {
    const conditions: (SQL | undefined)[] = [
      eq(contacts.workspaceId, workspaceId),
      isNull(contacts.deletedAt),
    ];

    if (filter?.search) {
      conditions.push(
        or(
          ilike(contacts.firstName, `%${filter.search}%`),
          ilike(contacts.lastName, `%${filter.search}%`),
          ilike(contacts.email, `%${filter.search}%`),
          ilike(contacts.companyName, `%${filter.search}%`)
        )
      );
    }

    if (filter?.ownerId) {
      conditions.push(eq(contacts.ownerId, filter.ownerId));
    }

    if (filter?.tags && filter.tags.length > 0) {
      // JSONB array intersection query in Postgres using the ?| operator
      const tagsArrayStr = filter.tags.map(t => `'${t}'`).join(',');
      conditions.push(sql`${contacts.tags} ?| array[${sql.raw(tagsArrayStr)}]`);
    }

    return this.dbService.db.query.contacts.findMany({
      where: and(...conditions),
      with: {
        owner: {
          columns: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
      orderBy: [desc(contacts.createdAt)],
      limit: filter?.limit || 50,
      offset: filter?.offset || 0,
    });
  }

  async findOne(id: string, workspaceId: string) {
    const contact = await this.dbService.db.query.contacts.findFirst({
      where: and(
        eq(contacts.id, id),
        eq(contacts.workspaceId, workspaceId),
        isNull(contacts.deletedAt)
      ),
      with: {
        owner: {
          columns: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return contact;
  }

  async update(id: string, workspaceId: string, updateContactDto: UpdateContactDto) {
    await this.findOne(id, workspaceId);

    const updatePayload = {
      firstName: updateContactDto.firstName,
      lastName: updateContactDto.lastName,
      email: updateContactDto.email,
      phone: updateContactDto.phone,
      companyName: updateContactDto.companyName,
      sourceChannel: updateContactDto.sourceChannel,
      metadata: updateContactDto.metadata,
      tags: updateContactDto.tags,
    };

    const [updatedContact] = await this.dbService.db
      .update(contacts)
      .set(updatePayload)
      .where(eq(contacts.id, id))
      .returning();

    return updatedContact;
  }

  async remove(id: string, workspaceId: string) {
    await this.findOne(id, workspaceId);

    const [deletedContact] = await this.dbService.db
      .update(contacts)
      .set({ deletedAt: new Date() })
      .where(eq(contacts.id, id))
      .returning();

    return deletedContact;
  }

  async getCount(workspaceId: string): Promise<number> {
    const result = await this.dbService.db
      .select({ count: contacts.id })
      .from(contacts)
      .where(and(eq(contacts.workspaceId, workspaceId), isNull(contacts.deletedAt)));
    return result.length;
  }
}
