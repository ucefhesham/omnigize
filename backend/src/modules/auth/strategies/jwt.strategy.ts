import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { DatabaseService } from '../../../database/database.service';
import { TokenBlacklistService } from '../token-blacklist.service';
import { users } from '../../../db/schema';
import { eq, isNull, and } from 'drizzle-orm';

export interface JwtPayload {
  sub: string;
  email: string;
  workspaceId?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private dbService: DatabaseService,
    private tokenBlacklistService: TokenBlacklistService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (token && this.tokenBlacklistService.isBlacklisted(token)) {
      throw new UnauthorizedException('Token has been revoked');
    }

    const user = await this.dbService.db.query.users.findFirst({
      where: and(eq(users.id, payload.sub), isNull(users.deletedAt)),
      with: {
        department: true,
        team: true,
        userRoles: {
          with: {
            role: {
              with: {
                rolePermissions: {
                  with: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        workspace: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or deleted');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      workspaceId: user.workspaceId,
      workspace: user.workspace,
      department: user.department,
      team: user.team,
      roles: user.userRoles.map((ur) => ur.role.name),
      permissions: user.userRoles.flatMap(
        (ur) => ur.role.rolePermissions.map((rp) => rp.permission.action) || [],
      ),
    };
  }
}
