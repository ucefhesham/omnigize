import { Resolver, Mutation, Args, ObjectType, Field, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
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
  @UseGuards(ThrottlerGuard)
  @Throttle({ short: { limit: 5, ttl: 1000 }, medium: { limit: 10, ttl: 10000 } })
  @Mutation(() => AuthPayload)
  async login(@Args() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ short: { limit: 3, ttl: 1000 }, medium: { limit: 5, ttl: 10000 } })
  @Mutation(() => AuthPayload)
  async register(@Args() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ short: { limit: 5, ttl: 1000 }, medium: { limit: 10, ttl: 10000 } })
  @Mutation(() => RefreshTokenPayload)
  async refreshToken(@Args('token') token: string) {
    return this.authService.refreshToken(token);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  async logout(@Context() context: { req: { headers: { authorization?: string } } }) {
    const authHeader = context.req?.headers?.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      await this.authService.logout(token);
    }
    return true;
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ short: { limit: 5, ttl: 1000 }, medium: { limit: 10, ttl: 10000 } })
  @Mutation(() => Boolean)
  async verifyEmail(@Args('token') token: string) {
    return this.authService.verifyEmail(token);
  }
}
