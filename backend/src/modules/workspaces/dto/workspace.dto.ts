import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsObject, IsUrl } from 'class-validator';

@InputType()
export class CreateWorkspaceDto {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  slug?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  domain?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  industry?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  logo?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

@InputType()
export class UpdateWorkspaceDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  slug?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  domain?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  industry?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  logo?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  subscriptionTier?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  isActive?: boolean;
}
