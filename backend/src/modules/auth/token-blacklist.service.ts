import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

@Injectable()
export class TokenBlacklistService implements OnModuleInit {
  private readonly logger = new Logger(TokenBlacklistService.name);
  private blacklist: Set<string> = new Set();

  onModuleInit() {
    // Clean expired tokens every 15 minutes
    setInterval(() => {
      this.cleanExpired();
    }, 15 * 60 * 1000);
    this.logger.log('Token blacklist cleanup scheduled (every 15 minutes)');
  }

  add(token: string): void {
    this.blacklist.add(token);
    this.logger.log('Token added to blacklist');
  }

  isBlacklisted(token: string): boolean {
    return this.blacklist.has(token);
  }

  cleanExpired(): void {
    const sizeBefore = this.blacklist.size;
    const now = Date.now();
    for (const token of this.blacklist) {
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        if (payload.exp * 1000 < now) {
          this.blacklist.delete(token);
        }
      } catch {
        this.blacklist.delete(token);
      }
    }
    const removed = sizeBefore - this.blacklist.size;
    if (removed > 0) {
      this.logger.log(`Cleaned ${removed} expired tokens from blacklist`);
    }
  }
}
