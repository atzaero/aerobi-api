import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { RemoveAerodromeGroupDocs } from '../docs/remove-aerodrome-group.docs';
import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import { RemoveAerodromeGroupService } from '../services/remove-aerodrome-group.service';

@ApiTags('Aerodrome Groups')
@Controller('aerodrome-groups')
@UseGuards(AerobiApiKeyGuard)
export class RemoveAerodromeGroupController {
  constructor(private readonly service: RemoveAerodromeGroupService) {}

  @Delete(':id')
  @RemoveAerodromeGroupDocs()
  handle(@Param('id') id: string): Promise<AerodromeGroupResponseDTO> {
    // TODO: obter deletedBy do contexto autenticado
    return this.service.execute({ id, deletedBy: 'system' });
  }
}
