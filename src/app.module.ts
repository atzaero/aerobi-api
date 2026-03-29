import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { HealthModule } from '@/modules/health/health.module';
import { RabModule } from '@/modules/rab/rab.module';
import { SchedulerModule } from '@/modules/scheduler/scheduler.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    HealthModule,
    RabModule,
    SchedulerModule,
  ],
})
export class AppModule {}
