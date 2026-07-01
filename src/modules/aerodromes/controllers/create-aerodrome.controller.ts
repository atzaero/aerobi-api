import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { CreateAerodromeDocs } from '../docs/create-aerodrome.docs';
import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import { CreateAerodromeDTO } from '../dtos/create-aerodrome.dto';
import { CreateAerodromeService } from '../services/create-aerodrome.service';

@ApiTags('Aerodromes')
@Controller('aerodromes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CreateAerodromeController {
  constructor(private readonly service: CreateAerodromeService) {}

  @Post()
  @RequirePermission('aerodrome', 'create')
  @CreateAerodromeDocs()
  handle(
    @Body() dto: CreateAerodromeDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<AerodromeResponseDTO> {
    return this.service.execute(dto, actor);
  }
}
