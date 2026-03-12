import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventsGateway } from './gateway/events.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ConfigModule, AuthModule],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
