import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { CreateAerodromeGroupDocs } from '../docs/create-aerodrome-group.docs';
import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import { CreateAerodromeGroupDTO } from '../dtos/create-aerodrome-group.dto';
import { CreateAerodromeGroupService } from '../services/create-aerodrome-group.service';

@ApiTags('Aerodrome Groups')
@Controller('aerodrome-groups')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CreateAerodromeGroupController {
  constructor(private readonly service: CreateAerodromeGroupService) {}

  @Post()
  @RequirePermission('group', 'create')
  @CreateAerodromeGroupDocs()
  handle(
    @Body() dto: CreateAerodromeGroupDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<AerodromeGroupResponseDTO> {
    return this.service.execute(dto, actor);
  }
}
