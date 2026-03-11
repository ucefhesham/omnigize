import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { TokenBlacklistService } from './token-blacklist.service';
import { EmailVerificationService } from './email-verification.service';

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
    private prisma: PrismaService,
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

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserWithRelations | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        department: true,
        team: true,
        userRoles: {
          include: {
            role: true,
          },
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
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    let workspace;
    let workspaceId: string;

    if (registerDto.workspaceId) {
      workspaceId = registerDto.workspaceId;
    } else {
      workspace = await this.prisma.workspace.create({
        data: {
          name:
            registerDto.workspaceName || `${registerDto.firstName}'s Workspace`,
          slug:
            registerDto.workspaceName?.toLowerCase().replace(/\s+/g, '-') ||
            `${registerDto.firstName.toLowerCase()}-workspace`,
          settings: {},
        },
      });
      workspaceId = workspace.id;
    }

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        passwordHash: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        workspaceId,
      },
      include: {
        workspace: true,
      },
    });

    const defaultRole = await this.prisma.role.findFirst({
      where: {
        workspaceId,
        name: 'Admin',
      },
    });

    if (defaultRole) {
      await this.prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: defaultRole.id,
        },
      });
    }

    const payload = {
      sub: user.id,
      email: user.email,
      workspaceId: user.workspaceId,
    };

    // Send verification email
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
        workspace: user.workspace,
      },
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.getRefreshSecret(),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          workspace: true,
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user || user.deletedAt) {
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
