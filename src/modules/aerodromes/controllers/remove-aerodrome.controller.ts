import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { RemoveAerodromeDocs } from '../docs/remove-aerodrome.docs';
import { AerodromeParamDTO } from '../dtos/aerodrome-param.dto';
import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import { RemoveAerodromeService } from '../services/remove-aerodrome.service';

@ApiTags('Aerodromes')
@Controller('aerodromes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RemoveAerodromeController {
  constructor(private readonly service: RemoveAerodromeService) {}

  @Delete(':id')
  @RequirePermission('aerodrome', 'delete')
  @RemoveAerodromeDocs()
  handle(
    @Param() { id }: AerodromeParamDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<AerodromeResponseDTO> {
    return this.service.execute(id, actor);
  }
}
