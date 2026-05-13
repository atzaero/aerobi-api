import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { ErrorMessageModule } from '@/common/error-messages/error-message.module';
import { AerodromeFeedbacksModule } from '@/modules/aerodrome-feedbacks/aerodrome-feedbacks.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { AerodromeGeojsonsModule } from '@/modules/aerodrome-geojsons/aerodrome-geojsons.module';
import { AerodromeGroupsModule } from '@/modules/aerodrome-groups/aerodrome-groups.module';
import { AiswebModule } from '@/modules/aisweb/aisweb.module';
import { AnacModule } from '@/modules/anac/anac.module';
import { HealthModule } from '@/modules/health/health.module';
import { LandingRequestsModule } from '@/modules/landing-requests/landing-requests.module';
import { OperationalAerodromesModule } from '@/modules/operational-aerodromes/operational-aerodromes.module';
import { PilotLandingsModule } from '@/modules/pilot-landings/pilot-landings.module';
import { PlugfieldModule } from '@/modules/plugfield/plugfield.module';
import { PrivateAerodromesModule } from '@/modules/private-aerodromes/private-aerodromes.module';
import { PublicAerodromesModule } from '@/modules/public-aerodromes/public-aerodromes.module';
import { RabModule } from '@/modules/rab/rab.module';
import { SchedulerModule } from '@/modules/scheduler/scheduler.module';
import { TechnicalVisitsModule } from '@/modules/technical-visits/technical-visits.module';
import { TokensModule } from '@/modules/tokens/tokens.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    ErrorMessageModule,
    HealthModule,
    AnacModule,
    RabModule,
    PlugfieldModule,
    AiswebModule,
    PrivateAerodromesModule,
    PublicAerodromesModule,
    SchedulerModule,
    AerodromeGroupsModule,
    OperationalAerodromesModule,
    LandingRequestsModule,
    TechnicalVisitsModule,
    AerodromeGeojsonsModule,
    AerodromeFeedbacksModule,
    PilotLandingsModule,
    TokensModule,
    AuthModule,
  ],
})
export class AppModule {}
