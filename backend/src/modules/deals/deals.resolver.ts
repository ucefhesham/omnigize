import {
  Resolver,
  Query,
  Mutation,
  Args,
  ObjectType,
  Field,
  ID,
  Int,
  Float,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DealsService } from './deals.service';
import { CreateDealDto, UpdateDealDto, DealFilterDto } from './dto/deal.dto';
import { CurrentUser } from '../../common/decorators';
import { AuthGuard } from '../../common/guards';

@ObjectType()
export class DealResponse {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field(() => String, { nullable: true })
  value?: any;

  @Field({ nullable: true })
  currency?: string;

  @Field()
  probability: number;

  @Field({ nullable: true })
  expectedCloseDate?: Date;

  @Field({ nullable: true })
  actualCloseDate?: Date;

  @Field(() => String, { nullable: true })
  metadata?: any;

  @Field(() => [String])
  tags: string[];

  @Field(() => String, { nullable: true })
  owner?: any;

  @Field(() => String, { nullable: true })
  lead?: any;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class DealStatistics {
  @Field(() => Int)
  total: number;

  @Field(() => Float)
  totalValue: number;
}

@Resolver(() => DealResponse)
export class DealsResolver {
  constructor(private dealsService: DealsService) {}

  @UseGuards(AuthGuard)
  @Mutation(() => DealResponse)
  async createDeal(
    @Args('createDealDto') createDealDto: CreateDealDto,
    @CurrentUser() user: any,
  ) {
    return this.dealsService.create(user.workspaceId, createDealDto, user.id);
  }

  @UseGuards(AuthGuard)
  @Query(() => [DealResponse])
  async deals(
    @Args('filter', { nullable: true }) filter: DealFilterDto,
    @CurrentUser() user: any,
  ) {
    return this.dealsService.findAll(user.workspaceId, filter);
  }

  @UseGuards(AuthGuard)
  @Query(() => DealResponse)
  async deal(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ) {
    return this.dealsService.findOne(id, user.workspaceId);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => DealResponse)
  async updateDeal(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateDealDto') updateDealDto: UpdateDealDto,
    @CurrentUser() user: any,
  ) {
    return this.dealsService.update(id, user.workspaceId, updateDealDto);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  async deleteDeal(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ) {
    await this.dealsService.remove(id, user.workspaceId);
    return true;
  }

  @UseGuards(AuthGuard)
  @Query(() => DealStatistics)
  async dealStatistics(@CurrentUser() user: any) {
    return this.dealsService.getStatistics(user.workspaceId);
  }
}
