import { InputType, Field, Int, Float } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsUUID,
  Min,
  Max,
  IsDateString,
} from 'class-validator';

@InputType()
export class CreateDealDto {
  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  leadId?: string;

  @Field()
  @IsString()
  name: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0)
  value?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  currency?: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  probability?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @Field({ nullable: true })
  @IsDateString()
  @IsOptional()
  expectedCloseDate?: string;
}

@InputType()
export class UpdateDealDto {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0)
  value?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  currency?: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  probability?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @Field({ nullable: true })
  @IsDateString()
  @IsOptional()
  expectedCloseDate?: string;

  @Field({ nullable: true })
  @IsDateString()
  @IsOptional()
  actualCloseDate?: string;
}

@InputType()
export class DealFilterDto {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  search?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  leadId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  ownerId?: string;

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
