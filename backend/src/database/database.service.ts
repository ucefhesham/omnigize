import { Injectable } from '@nestjs/common';
import { neon } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';
import { ClsService, ClsStore } from 'nestjs-cls';
import { ConfigService } from '@nestjs/config';
import { sql } from 'drizzle-orm';

export interface AppClsStore extends ClsStore {
  workspaceId?: string;
  userId?: string;
  tx?: any;
}

@Injectable()
export class DatabaseService {
  public readonly globalDb: NeonHttpDatabase<typeof schema>;

  constructor(
    private cls: ClsService<AppClsStore>,
    private configService: ConfigService
  ) {
    const databaseUrl = this.configService.get<string>('DATABASE_URL')!;
    // Using neon serverless driver
    const sqlClient = neon(databaseUrl);
    this.globalDb = drizzle(sqlClient, { schema });
  }

  // Fallback pattern: if a transaction is active in CLS, use it; otherwise, use the global db instance.
  get db() {
    const tx = this.cls.get('tx');
    return tx || this.globalDb;
  }

  // Critical RLS wrapper: Creates a transaction, injects the workspace context to Postgres, 
  // and stores the active transaction in AsyncLocalStorage for downstream repositories to use.
  async withWorkspaceContext<T>(callback: () => Promise<T>): Promise<T> {
    const workspaceId = this.cls.get('workspaceId');
    
    // If no context exists (e.g., system background job), execute normally
    if (!workspaceId) {
      return callback(); 
    }

    return this.globalDb.transaction(async (tx) => {
      // Set the session variable for the current transaction
      await tx.execute(sql`SET LOCAL app.current_workspace_id = '${sql.raw(workspaceId)}'`);
      
      // Inject the transaction object (tx) into the CLS context so any this.db calls inside the callback use it
      return this.cls.runWith({ ...this.cls.get(), tx }, callback);
    });
  }
}
