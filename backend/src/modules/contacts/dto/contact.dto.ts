import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsArray,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import type { ChannelType } from '../../../db/schema/enums';
import { channelTypeEnum } from '../../../db/schema/enums';

@InputType()
export class CreateContactDto {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  firstName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  lastName?: string;

  @Field({ nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  phone?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  companyName?: string;

  @Field(() => String, { nullable: true })
  @IsEnum(channelTypeEnum.enumValues)
  @IsOptional()
  sourceChannel?: ChannelType;

  @Field(() => String, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  tags?: string[];
}

@InputType()
export class UpdateContactDto {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  firstName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  lastName?: string;

  @Field({ nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  phone?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  companyName?: string;

  @Field(() => String, { nullable: true })
  @IsEnum(channelTypeEnum.enumValues)
  @IsOptional()
  sourceChannel?: ChannelType;

  @Field(() => String, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  tags?: string[];
}

@InputType()
export class ContactFilterDto {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  search?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  ownerId?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0)
  limit?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0)
  offset?: number;
}
