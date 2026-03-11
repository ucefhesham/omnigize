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
import { UsersService } from './users.service';
import { UpdateUserDto, AssignRoleDto } from './dto/user.dto';
import { CurrentUser } from '../../common/decorators';
import { AuthGuard } from '../../common/guards';

@ObjectType()
export class UserResponse {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field()
  status: string;

  @Field()
  isWorkspaceOwner: boolean;

  @Field({ nullable: true })
  department?: any;

  @Field({ nullable: true })
  team?: any;

  @Field(() => [String])
  roles: string[];

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  lastLoginAt?: Date;
}

@Resolver(() => UserResponse)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Query(() => [UserResponse])
  async users(@CurrentUser() user: any) {
    return this.usersService.findAll(user.workspaceId);
  }

  @UseGuards(AuthGuard)
  @Query(() => UserResponse)
  async user(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ) {
    return this.usersService.findOne(id, user.workspaceId);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => UserResponse)
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateUserDto') updateUserDto: UpdateUserDto,
    @CurrentUser() user: any,
  ) {
    return this.usersService.update(id, user.workspaceId, updateUserDto);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  async deleteUser(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ) {
    await this.usersService.remove(id, user.workspaceId);
    return true;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => UserResponse)
  async assignRole(
    @Args('id', { type: () => ID }) id: string,
    @Args('assignRoleDto') assignRoleDto: AssignRoleDto,
    @CurrentUser() user: any,
  ) {
    return this.usersService.assignRole(id, user.workspaceId, assignRoleDto);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => UserResponse)
  async removeRole(
    @Args('id', { type: () => ID }) id: string,
    @Args('roleId', { type: () => ID }) roleId: string,
    @CurrentUser() user: any,
  ) {
    return this.usersService.removeRole(id, user.workspaceId, roleId);
  }

  @UseGuards(AuthGuard)
  @Query(() => UserResponse)
  async myProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.id, user.workspaceId);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => UserResponse)
  async updateMyProfile(
    @Args('updateUserDto') updateUserDto: UpdateUserDto,
    @CurrentUser() user: any,
  ) {
    return this.usersService.updateProfile(
      user.id,
      user.workspaceId,
      updateUserDto,
    );
  }
}
