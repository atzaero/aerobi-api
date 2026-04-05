import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { HealthModule } from '@/modules/health/health.module';
import { PlugfieldModule } from '@/modules/plugfield/plugfield.module';
import { PrivateAerodromesModule } from '@/modules/private-aerodromes/private-aerodromes.module';
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
    PlugfieldModule,
    PrivateAerodromesModule,
    SchedulerModule,
  ],
})
export class AppModule {}
