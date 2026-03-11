import { Resolver, Query, Mutation, Args, ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto, UpdateLeadDto, LeadFilterDto } from './dto/lead.dto';
import { CurrentUser } from '../../common/decorators';
import { AuthGuard } from '../../common/guards';

@ObjectType()
export class LeadResponse {
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

  @Field()
  metadata: any;

  @Field()
  tags: string[];

  @Field({ nullable: true })
  owner?: any;

  @Field(() => [DealResponse])
  deals: DealResponse[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class DealResponse {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  value: any;

  @Field({ nullable: true })
  expectedCloseDate?: Date;
}

@ObjectType()
export class LeadStatistics {
  @Field(() => Int)
  total: number;
}

@Resolver(() => LeadResponse)
export class LeadsResolver {
  constructor(private leadsService: LeadsService) {}

  @UseGuards(AuthGuard)
  @Mutation(() => LeadResponse)
  async createLead(
    @Args('createLeadDto') createLeadDto: CreateLeadDto,
    @CurrentUser() user: any,
  ) {
    return this.leadsService.create(user.workspaceId, createLeadDto, user.id);
  }

  @UseGuards(AuthGuard)
  @Query(() => [LeadResponse])
  async leads(
    @Args('filter', { nullable: true }) filter: LeadFilterDto,
    @CurrentUser() user: any,
  ) {
    return this.leadsService.findAll(user.workspaceId, filter);
  }

  @UseGuards(AuthGuard)
  @Query(() => LeadResponse)
  async lead(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ) {
    return this.leadsService.findOne(id, user.workspaceId);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => LeadResponse)
  async updateLead(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateLeadDto') updateLeadDto: UpdateLeadDto,
    @CurrentUser() user: any,
  ) {
    return this.leadsService.update(id, user.workspaceId, updateLeadDto);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  async deleteLead(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ) {
    await this.leadsService.remove(id, user.workspaceId);
    return true;
  }

  @UseGuards(AuthGuard)
  @Query(() => LeadStatistics)
  async leadStatistics(@CurrentUser() user: any) {
    return this.leadsService.getStatistics(user.workspaceId);
  }
}
