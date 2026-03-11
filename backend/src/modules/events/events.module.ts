import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventsGateway } from './gateway/events.gateway';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
