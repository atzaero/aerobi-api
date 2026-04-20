import { Module } from '@nestjs/common';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';
import { PrismaModule } from '@/prisma/prisma.module';

import { CreateAerodromeGroupController } from './controllers/create-aerodrome-group.controller';
import { FindAerodromeGroupByIdController } from './controllers/find-aerodrome-group-by-id.controller';
import { ListAerodromeGroupsController } from './controllers/list-aerodrome-groups.controller';
import { RemoveAerodromeGroupController } from './controllers/remove-aerodrome-group.controller';
import { UpdateAerodromeGroupController } from './controllers/update-aerodrome-group.controller';

import { AerodromeGroupRepository } from './repositories/aerodrome-group.repository';

import { CreateAerodromeGroupService } from './services/create-aerodrome-group.service';
import { FindAerodromeGroupByIdService } from './services/find-aerodrome-group-by-id.service';
import { ListAerodromeGroupsService } from './services/list-aerodrome-groups.service';
import { RemoveAerodromeGroupService } from './services/remove-aerodrome-group.service';
import { UpdateAerodromeGroupService } from './services/update-aerodrome-group.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    CreateAerodromeGroupController,
    UpdateAerodromeGroupController,
    ListAerodromeGroupsController,
    FindAerodromeGroupByIdController,
    RemoveAerodromeGroupController,
  ],
  providers: [
    AerobiApiKeyGuard,
    AerodromeGroupRepository,
    CreateAerodromeGroupService,
    UpdateAerodromeGroupService,
    ListAerodromeGroupsService,
    FindAerodromeGroupByIdService,
    RemoveAerodromeGroupService,
  ],
})
export class AerodromeGroupsModule {}
