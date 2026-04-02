import { Module } from '@nestjs/common';

import { PrivateAerodromesModule } from '@/modules/private-aerodromes/private-aerodromes.module';
import { RabModule } from '@/modules/rab/rab.module';

import { PrivateAerodromesSyncCron } from './services/private-aerodromes-sync.cron';
import { RabSyncCron } from './services/rab-sync.cron';

@Module({
  imports: [RabModule, PrivateAerodromesModule],
  providers: [RabSyncCron, PrivateAerodromesSyncCron],
})
export class SchedulerModule {}
