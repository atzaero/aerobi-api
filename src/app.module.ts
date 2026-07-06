import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

import { ErrorMessageModule } from '@/common/error-messages/error-message.module';
import { FeedbacksModule } from '@/modules/feedbacks/feedbacks.module';
import { AuditModule } from '@/modules/audit/audit.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { ConformityModule } from '@/modules/conformity/conformity.module';
import { ContactModule } from '@/modules/contact/contact.module';
import { DocumentsModule } from '@/modules/documents/documents.module';
import { GeojsonsModule } from '@/modules/geojsons/geojsons.module';
import { GroupsModule } from '@/modules/groups/groups.module';
import { AiswebModule } from '@/modules/aisweb/aisweb.module';
import { AnacModule } from '@/modules/anac/anac.module';
import { HealthModule } from '@/modules/health/health.module';
import { LandingRequestsModule } from '@/modules/landing-requests/landing-requests.module';
import { AerodromesModule } from '@/modules/aerodromes/aerodromes.module';
import { PilotLandingsModule } from '@/modules/pilot-landings/pilot-landings.module';
import { PlugfieldModule } from '@/modules/plugfield/plugfield.module';
import { PrivateAerodromesModule } from '@/modules/private-aerodromes/private-aerodromes.module';
import { PublicAerodromesModule } from '@/modules/public-aerodromes/public-aerodromes.module';
import { RabModule } from '@/modules/rab/rab.module';
import { MovementsModule } from '@/modules/movements/movements.module';
import { MaintenancesModule } from '@/modules/maintenances/maintenances.module';
import { TasksModule } from '@/modules/tasks/tasks.module';
import { GuessesModule } from '@/modules/guesses/guesses.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { StreamsModule } from '@/modules/streams/streams.module';
import { CamerasModule } from '@/modules/cameras/cameras.module';
import { SchedulerModule } from '@/modules/scheduler/scheduler.module';
import { TechnicalVisitsModule } from '@/modules/technical-visits/technical-visits.module';
import { TokensModule } from '@/modules/tokens/tokens.module';
import { UsersModule } from '@/modules/users/users.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    PrismaModule,
    ErrorMessageModule,
    HealthModule,
    AnacModule,
    RabModule,
    PlugfieldModule,
    AiswebModule,
    MovementsModule,
    MaintenancesModule,
    PrivateAerodromesModule,
    PublicAerodromesModule,
    SchedulerModule,
    GroupsModule,
    AerodromesModule,
    LandingRequestsModule,
    TechnicalVisitsModule,
    GeojsonsModule,
    DocumentsModule,
    FeedbacksModule,
    PilotLandingsModule,
    TokensModule,
    AuthModule,
    UsersModule,
    ConformityModule,
    ContactModule,
    NotificationsModule,
    StreamsModule,
    TasksModule,
    GuessesModule,
    CamerasModule,
    AuditModule,
  ],
})
export class AppModule {}
