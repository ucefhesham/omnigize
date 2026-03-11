import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../../database/database.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { TokenBlacklistService } from './token-blacklist.service';
import { EmailVerificationService } from './email-verification.service';
import { users, workspaces, roles, userRoles } from '../../db/schema';
import { eq, and, isNull } from 'drizzle-orm';

interface UserWithRelations {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  workspaceId: string;
  deletedAt: Date | null;
  workspace: any;
  userRoles: { role: { name: string } }[];
}

@Injectable()
export class AuthService {
  constructor(
    private dbService: DatabaseService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private tokenBlacklistService: TokenBlacklistService,
    private emailVerificationService: EmailVerificationService,
  ) {}

  private getRefreshSecret(): string {
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is required');
    }
    return secret;
  }

  async validateUser(email: string, password: string): Promise<UserWithRelations | null> {
    const user = await this.dbService.db.query.users.findFirst({
      where: eq(users.email, email),
      with: {
        department: true,
        team: true,
        userRoles: {
          with: { role: true },
        },
        workspace: true,
      },
    });

    if (!user || user.deletedAt || !user.passwordHash) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      workspaceId: user.workspaceId,
      deletedAt: user.deletedAt,
      workspace: user.workspace,
      userRoles: user.userRoles.map((ur) => ({ role: { name: ur.role.name } })),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      workspaceId: user.workspaceId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        expiresIn: '30d',
        secret: this.getRefreshSecret(),
      }),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        roles: user.userRoles.map((ur) => ur.role.name),
        workspace: user.workspace,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.dbService.db.query.users.findFirst({
      where: eq(users.email, registerDto.email),
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    return this.dbService.globalDb.transaction(async (tx) => {
      let workspaceId: string;

      if (!registerDto.workspaceId) {
        const slugStr = registerDto.workspaceName?.toLowerCase().replace(/\s+/g, '-') || `${registerDto.firstName.toLowerCase()}-workspace`;
        
        const [workspace] = await tx.insert(workspaces).values({
          name: registerDto.workspaceName || `${registerDto.firstName}'s Workspace`,
          slug: slugStr,
          settings: {},
        }).returning();
        
        workspaceId = workspace.id;

        // Give the owner an Admin role by default for the new workspace
        await tx.insert(roles).values({
          workspaceId: workspaceId,
          name: 'Admin',
          description: 'Workspace Administrator',
          isSystemRole: true,
        });
      } else {
        workspaceId = registerDto.workspaceId;
      }

      const [user] = await tx.insert(users).values({
        email: registerDto.email,
        passwordHash: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        workspaceId,
      }).returning();

      const defaultRole = await tx.query.roles.findFirst({
        where: and(
          eq(roles.workspaceId, workspaceId),
          eq(roles.name, 'Admin')
        ),
      });

      if (defaultRole) {
        await tx.insert(userRoles).values({
          userId: user.id,
          roleId: defaultRole.id,
        });
      }

      const userWorkspace = await tx.query.workspaces.findFirst({
        where: eq(workspaces.id, workspaceId)
      });

      const payload = {
        sub: user.id,
        email: user.email,
        workspaceId: user.workspaceId,
      };

      // Send verification email ideally async but keeping legacy pattern identical
      await this.emailVerificationService.sendVerificationEmail(user.id);

      return {
        access_token: this.jwtService.sign(payload),
        refresh_token: this.jwtService.sign(payload, {
          expiresIn: '30d',
          secret: this.getRefreshSecret(),
        }),
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          workspace: userWorkspace,
        },
      };
    });
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.getRefreshSecret(),
      });

      const user = await this.dbService.db.query.users.findFirst({
        where: and(eq(users.id, payload.sub), isNull(users.deletedAt)),
        with: {
          workspace: true,
          userRoles: {
            with: { role: true },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload = {
        sub: user.id,
        email: user.email,
        workspaceId: user.workspaceId,
      };

      return {
        access_token: this.jwtService.sign(newPayload),
        refresh_token: this.jwtService.sign(newPayload, {
          expiresIn: '30d',
          secret: this.getRefreshSecret(),
        }),
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(token: string): Promise<boolean> {
    this.tokenBlacklistService.add(token);
    return true;
  }

  async verifyEmail(token: string): Promise<boolean> {
    return this.emailVerificationService.verifyEmail(token);
  }
}
