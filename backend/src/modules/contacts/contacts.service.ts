import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateContactDto,
  UpdateContactDto,
  ContactFilterDto,
} from './dto/contact.dto';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async create(
    workspaceId: string,
    createContactDto: CreateContactDto,
    userId: string,
  ) {
    return this.prisma.contact.create({
      data: {
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
      },
    });
  }

  async findAll(workspaceId: string, filter?: ContactFilterDto) {
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

    if (filter?.tags && filter.tags.length > 0) {
      where.tags = { hasSome: filter.tags };
    }

    return this.prisma.contact.findMany({
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
    const contact = await this.prisma.contact.findFirst({
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
        conversations: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return contact;
  }

  async update(
    id: string,
    workspaceId: string,
    updateContactDto: UpdateContactDto,
  ) {
    await this.findOne(id, workspaceId);

    return this.prisma.contact.update({
      where: { id },
      data: {
        firstName: updateContactDto.firstName,
        lastName: updateContactDto.lastName,
        email: updateContactDto.email,
        phone: updateContactDto.phone,
        companyName: updateContactDto.companyName,
        sourceChannel: updateContactDto.sourceChannel,
        metadata: updateContactDto.metadata,
        tags: updateContactDto.tags,
      },
    });
  }

  async remove(id: string, workspaceId: string) {
    await this.findOne(id, workspaceId);

    return this.prisma.contact.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getCount(workspaceId: string): Promise<number> {
    return this.prisma.contact.count({ where: { workspaceId } });
  }
}
