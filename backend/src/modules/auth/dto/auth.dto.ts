import { IsEmail, IsNotEmpty, IsOptional, MinLength, Matches } from 'class-validator';
import { ArgsType, Field, InputType } from '@nestjs/graphql';

@ArgsType()
export class LoginDto {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}

@ArgsType()
export class RegisterDto {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+\-_])[A-Za-z\d@$!%*?&#+\-_]{8,}$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character (@$!%*?&#+\\-_)',
    },
  )
  password: string;

  @Field()
  @IsNotEmpty()
  firstName: string;

  @Field()
  @IsNotEmpty()
  lastName: string;

  @Field({ nullable: true })
  @IsOptional()
  workspaceName?: string;

  @Field({ nullable: true })
  @IsOptional()
  workspaceId?: string;
}
