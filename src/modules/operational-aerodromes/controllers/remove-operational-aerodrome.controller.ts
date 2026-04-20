import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { RemoveOperationalAerodromeDocs } from '../docs/remove-operational-aerodrome.docs';
import { OperationalAerodromeResponseDTO } from '../dtos/operational-aerodrome-response.dto';
import { RemoveOperationalAerodromeService } from '../services/remove-operational-aerodrome.service';

@ApiTags('Operational Aerodromes')
@Controller('operational-aerodromes')
@UseGuards(AerobiApiKeyGuard)
export class RemoveOperationalAerodromeController {
  constructor(private readonly service: RemoveOperationalAerodromeService) {}

  @Delete(':id')
  @RemoveOperationalAerodromeDocs()
  handle(@Param('id') id: string): Promise<OperationalAerodromeResponseDTO> {
    // TODO: obter deletedBy do contexto autenticado
    return this.service.execute({ id, deletedBy: 'system' });
  }
}
