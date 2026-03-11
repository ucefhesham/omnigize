import { IsString, IsOptional, IsEmail, IsUUID, IsEnum } from 'class-validator';
import type { ChannelType } from '../../../db/schema/enums';
import type { UserStatus } from '../../../db/schema/enums';
import { channelTypeEnum } from '../../../db/schema/enums';
import { userStatusEnum } from '../../../db/schema/enums';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsUUID()
  teamId?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsUUID()
  teamId?: string;

  @IsOptional()
  @IsEnum(userStatusEnum.enumValues)
  status?: UserStatus;
}

export class AssignRoleDto {
  @IsUUID()
  roleId: string;
}
