import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsEmail, IsUUID, IsEnum } from 'class-validator';
import type { UserStatus } from '../../../db/schema/enums';
import { userStatusEnum } from '../../../db/schema/enums';

@InputType()
export class CreateUserDto {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  firstName: string;

  @Field()
  @IsString()
  lastName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  teamId?: string;
}

@InputType()
export class UpdateUserDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  firstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  avatar?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  teamId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(userStatusEnum.enumValues)
  status?: UserStatus;
}

@InputType()
export class AssignRoleDto {
  @Field()
  @IsUUID()
  roleId: string;
}
