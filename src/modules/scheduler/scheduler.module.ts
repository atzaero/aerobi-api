import { Module } from '@nestjs/common';

import { PrivateAerodromesModule } from '@/modules/private-aerodromes/private-aerodromes.module';
import { PublicAerodromesModule } from '@/modules/public-aerodromes/public-aerodromes.module';
import { RabModule } from '@/modules/rab/rab.module';

import { PrivateAerodromesSyncCron } from './services/private-aerodromes-sync.cron';
import { PublicAerodromesSyncCron } from './services/public-aerodromes-sync.cron';
import { RabSyncCron } from './services/rab-sync.cron';

@Module({
  imports: [RabModule, PrivateAerodromesModule, PublicAerodromesModule],
  providers: [RabSyncCron, PrivateAerodromesSyncCron, PublicAerodromesSyncCron],
})
export class SchedulerModule {}
