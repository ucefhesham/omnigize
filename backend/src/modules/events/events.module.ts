import { Module, Global } from '@nestjs/common';
import { EventsGateway } from './gateway/events.gateway';

@Global()
@Module({
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
