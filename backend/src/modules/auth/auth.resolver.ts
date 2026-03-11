import { Resolver, Mutation, Args, ObjectType, Field } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { Public } from '../../common/decorators';
import { AuthGuard } from '../../common/guards';

@ObjectType()
export class AuthPayload {
  @Field()
  access_token: string;

  @Field()
  refresh_token: string;

  @Field(() => UserResponse)
  user: UserResponse;
}

@ObjectType()
export class UserResponse {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field(() => [String])
  roles: string[];

  @Field(() => WorkspaceResponse, { nullable: true })
  workspace?: WorkspaceResponse;
}

@ObjectType()
export class WorkspaceResponse {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;
}

@ObjectType()
export class RefreshTokenPayload {
  @Field()
  access_token: string;

  @Field()
  refresh_token: string;
}

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Public()
  @Mutation(() => AuthPayload)
  async login(@Args() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Mutation(() => AuthPayload)
  async register(@Args() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Mutation(() => RefreshTokenPayload)
  async refreshToken(@Args('token') token: string) {
    return this.authService.refreshToken(token);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  async logout() {
    return true;
  }
}
