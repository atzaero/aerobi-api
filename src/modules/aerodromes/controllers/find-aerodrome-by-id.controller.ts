import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { RequiresGroupScope } from '@/modules/auth/decorators/requires-group-scope.decorator';
import { GroupScopeGuard } from '@/modules/auth/guards/group-scope.guard';
import { GroupScopeSubject } from '@/modules/auth/guards/group-scope.subject';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';

import { FindAerodromeByIdDocs } from '../docs/find-aerodrome-by-id.docs';
import { AerodromeParamDTO } from '../dtos/aerodrome-param.dto';
import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import { FindAerodromeByIdService } from '../services/find-aerodrome-by-id.service';

@ApiTags('Aerodromes')
@Controller('aerodromes')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class FindAerodromeByIdController {
  constructor(private readonly service: FindAerodromeByIdService) {}

  @Get(':id')
  @RequirePermission('aerodrome', 'read')
  @RequiresGroupScope(GroupScopeSubject.AERODROME)
  @FindAerodromeByIdDocs()
  handle(@Param() { id }: AerodromeParamDTO): Promise<AerodromeResponseDTO> {
    return this.service.execute({ id });
  }
}
