import {
  Resolver,
  Query,
  Mutation,
  Args,
  ObjectType,
  Field,
  ID,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './dto/workspace.dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { AuthGuard, RolesGuard } from '../../common/guards';

@ObjectType()
export class WorkspaceResponse {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  domain?: string;

  @Field()
  industry: string;

  @Field({ nullable: true })
  logo?: string;

  @Field()
  subscriptionTier: string;

  @Field()
  isActive: boolean;

  @Field()
  settings: any;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class WorkspaceWithStats extends WorkspaceResponse {
  @Field()
  statistics: {
    contacts: number;
    leads: number;
    deals: number;
    properties: number;
    users: number;
  };
}

@Resolver(() => WorkspaceResponse)
export class WorkspacesResolver {
  constructor(private workspacesService: WorkspacesService) {}

  @UseGuards(AuthGuard)
  @Mutation(() => WorkspaceResponse)
  async createWorkspace(
    @CurrentUser() user: any,
    @Args('createWorkspaceDto') createWorkspaceDto: CreateWorkspaceDto,
  ) {
    return this.workspacesService.create(user.id, createWorkspaceDto);
  }

  @UseGuards(AuthGuard)
  @Query(() => [WorkspaceResponse])
  async myWorkspaces(@CurrentUser() user: any) {
    return this.workspacesService.findAll(user.id);
  }

  @UseGuards(AuthGuard)
  @Query(() => WorkspaceWithStats)
  async workspace(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ) {
    return this.workspacesService.getStatistics(id, user.id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Admin')
  @Mutation(() => WorkspaceResponse)
  async updateWorkspace(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateWorkspaceDto') updateWorkspaceDto: UpdateWorkspaceDto,
    @CurrentUser() user: any,
  ) {
    return this.workspacesService.update(id, user.id, updateWorkspaceDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Admin')
  @Mutation(() => Boolean)
  async deleteWorkspace(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ) {
    await this.workspacesService.remove(id, user.id);
    return true;
  }
}
