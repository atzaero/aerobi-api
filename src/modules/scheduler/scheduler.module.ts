import { Module } from '@nestjs/common';

import { RabModule } from '@/modules/rab/rab.module';

import { RabSyncCron } from './services/rab-sync.cron';

@Module({
  imports: [RabModule],
  providers: [RabSyncCron],
})
export class SchedulerModule {}
