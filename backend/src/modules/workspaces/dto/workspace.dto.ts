import { IsString, IsOptional, IsObject, IsUrl } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsUrl()
  logo?: string;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class UpdateWorkspaceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsUrl()
  logo?: string;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @IsOptional()
  @IsString()
  subscriptionTier?: string;

  @IsOptional()
  @IsString()
  isActive?: boolean;
}
