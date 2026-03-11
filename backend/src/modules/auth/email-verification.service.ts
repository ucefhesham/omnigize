import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

interface VerificationRecord {
  userId: string;
  token: string;
  expiresAt: Date;
  verified: boolean;
}

@Injectable()
export class EmailVerificationService implements OnModuleInit {
  private readonly logger = new Logger(EmailVerificationService.name);
  private verificationTokens: Map<string, VerificationRecord> = new Map();

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    // Clean expired verification tokens every hour
    setInterval(() => {
      this.cleanExpiredTokens();
    }, 60 * 60 * 1000);
  }

  async sendVerificationEmail(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    this.verificationTokens.set(token, {
      userId,
      token,
      expiresAt,
      verified: false,
    });

    // TODO: Replace with actual email sending (e.g. nodemailer, SendGrid, etc.)
    this.logger.log(
      `📧 Email verification token for ${user.email}: ${token}`,
    );
    this.logger.log(
      `   Verification link: /verify-email?token=${token}`,
    );

    return token;
  }

  async verifyEmail(token: string): Promise<boolean> {
    const record = this.verificationTokens.get(token);

    if (!record) {
      this.logger.warn(`Verification attempt with invalid token: ${token}`);
      return false;
    }

    if (record.expiresAt < new Date()) {
      this.logger.warn(`Verification attempt with expired token for user: ${record.userId}`);
      this.verificationTokens.delete(token);
      return false;
    }

    record.verified = true;

    this.logger.log(`Email verified for user: ${record.userId}`);
    return true;
  }

  isVerified(userId: string): boolean {
    for (const record of this.verificationTokens.values()) {
      if (record.userId === userId && record.verified) {
        return true;
      }
    }
    return false;
  }

  private cleanExpiredTokens(): void {
    const now = new Date();
    let cleaned = 0;
    for (const [token, record] of this.verificationTokens.entries()) {
      if (record.expiresAt < now) {
        this.verificationTokens.delete(token);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      this.logger.log(`Cleaned ${cleaned} expired verification tokens`);
    }
  }
}
