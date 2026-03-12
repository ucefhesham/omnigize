import {
  Resolver,
  Query,
  Mutation,
  Args,
  ObjectType,
  Field,
  ID,
  Int,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import {
  CreateContactDto,
  UpdateContactDto,
  ContactFilterDto,
} from './dto/contact.dto';
import { CurrentUser } from '../../common/decorators';
import { AuthGuard } from '../../common/guards';

@ObjectType()
export class ContactResponse {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  companyName?: string;

  @Field({ nullable: true })
  sourceChannel?: string;

  @Field(() => String, { nullable: true })
  metadata?: any;

  @Field(() => [String])
  tags: string[];

  @Field(() => String, { nullable: true })
  owner?: any;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class ContactListResponse {
  @Field(() => [ContactResponse])
  contacts: ContactResponse[];

  @Field(() => Int)
  total: number;
}

@Resolver(() => ContactResponse)
export class ContactsResolver {
  constructor(private contactsService: ContactsService) {}

  @UseGuards(AuthGuard)
  @Mutation(() => ContactResponse)
  async createContact(
    @Args('createContactDto') createContactDto: CreateContactDto,
    @CurrentUser() user: any,
  ) {
    return this.contactsService.create(
      user.workspaceId,
      createContactDto,
      user.id,
    );
  }

  @UseGuards(AuthGuard)
  @Query(() => [ContactResponse])
  async contacts(
    @Args('filter', { nullable: true }) filter: ContactFilterDto,
    @CurrentUser() user: any,
  ) {
    return this.contactsService.findAll(user.workspaceId, filter);
  }

  @UseGuards(AuthGuard)
  @Query(() => ContactResponse)
  async contact(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ) {
    return this.contactsService.findOne(id, user.workspaceId);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => ContactResponse)
  async updateContact(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateContactDto') updateContactDto: UpdateContactDto,
    @CurrentUser() user: any,
  ) {
    return this.contactsService.update(id, user.workspaceId, updateContactDto);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  async deleteContact(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ) {
    await this.contactsService.remove(id, user.workspaceId);
    return true;
  }
}
