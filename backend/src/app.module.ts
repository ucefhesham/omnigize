import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { UsersModule } from './modules/users/users.module';
import { EventsModule } from './modules/events/events.module';
import { AllExceptionsFilter } from './common/filters';
import { LoggingInterceptor } from './common/interceptors';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: process.env.GRAPHQL_PLAYGROUND === 'true',
      debug: process.env.GRAPHQL_DEBUG === 'true',
      context: ({ req, res }: { req: unknown; res: unknown }) => ({ req, res }),
      formatError: (error: unknown) => {
        const err = error as {
          message?: unknown;
          locations?: unknown;
          path?: unknown;
          extensions?: unknown;
        };
        return {
          message: String(err.message || 'Internal server error'),
          locations: err.locations as any,
          path: err.path as any,
          extensions: err.extensions as any,
        };
      },
    }),
    PrismaModule,
    AuthModule,
    WorkspacesModule,
    UsersModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
