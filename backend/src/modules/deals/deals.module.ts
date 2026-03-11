import { Module } from '@nestjs/common';
import { DealsService } from './deals.service';
import { DealsResolver } from './deals.resolver';

@Module({
  providers: [DealsService, DealsResolver],
  exports: [DealsService],
})
export class DealsModule {}
