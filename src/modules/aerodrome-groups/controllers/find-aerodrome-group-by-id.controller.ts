import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { RequiresGroupScope } from '@/modules/auth/decorators/requires-group-scope.decorator';
import { GroupScopeGuard } from '@/modules/auth/guards/group-scope.guard';
import { GroupScopeSubject } from '@/modules/auth/guards/group-scope.subject';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';

import { FindAerodromeGroupByIdDocs } from '../docs/find-aerodrome-group-by-id.docs';
import { AerodromeGroupParamDTO } from '../dtos/aerodrome-group-param.dto';
import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import { FindAerodromeGroupByIdService } from '../services/find-aerodrome-group-by-id.service';

@ApiTags('Aerodrome Groups')
@Controller('aerodrome-groups')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class FindAerodromeGroupByIdController {
  constructor(private readonly service: FindAerodromeGroupByIdService) {}

  @Get(':id')
  @RequirePermission('group', 'read')
  @RequiresGroupScope(GroupScopeSubject.AERODROME_GROUP)
  @FindAerodromeGroupByIdDocs()
  handle(
    @Param() { id }: AerodromeGroupParamDTO,
  ): Promise<AerodromeGroupResponseDTO> {
    return this.service.execute(id);
  }
}
