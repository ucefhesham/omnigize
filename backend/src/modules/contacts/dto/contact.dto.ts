import {
  IsString,
  IsOptional,
  IsEmail,
  IsArray,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { ChannelType } from '@prisma/client';

export class CreateContactDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsEnum(ChannelType)
  @IsOptional()
  sourceChannel?: ChannelType;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsArray()
  @IsOptional()
  tags?: string[];
}

export class UpdateContactDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsEnum(ChannelType)
  @IsOptional()
  sourceChannel?: ChannelType;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsArray()
  @IsOptional()
  tags?: string[];
}

export class ContactFilterDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  ownerId?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  offset?: number;
}
