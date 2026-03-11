import { IsString, IsOptional, IsArray, IsNumber, IsUUID, Min, Max, IsDateString } from 'class-validator';

export class CreateDealDto {
  @IsUUID()
  @IsOptional()
  leadId?: string;

  @IsString()
  name: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  value?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  probability?: number;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsDateString()
  @IsOptional()
  expectedCloseDate?: string;
}

export class UpdateDealDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  value?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  probability?: number;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsDateString()
  @IsOptional()
  expectedCloseDate?: string;

  @IsDateString()
  @IsOptional()
  actualCloseDate?: string;
}

export class DealFilterDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsUUID()
  @IsOptional()
  leadId?: string;

  @IsString()
  @IsOptional()
  ownerId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  offset?: number;
}
