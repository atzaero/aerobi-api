import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { RemoveOperationalAerodromeDocs } from '../docs/remove-operational-aerodrome.docs';
import { OperationalAerodromeParamDTO } from '../dtos/operational-aerodrome-param.dto';
import { OperationalAerodromeResponseDTO } from '../dtos/operational-aerodrome-response.dto';
import { RemoveOperationalAerodromeService } from '../services/remove-operational-aerodrome.service';

@ApiTags('Operational Aerodromes')
@Controller('operational-aerodromes')
@UseGuards(AerobiApiKeyGuard)
export class RemoveOperationalAerodromeController {
  constructor(private readonly service: RemoveOperationalAerodromeService) {}

  @Delete(':operationalAerodromeId')
  @RemoveOperationalAerodromeDocs()
  handle(
    @Param() params: OperationalAerodromeParamDTO,
  ): Promise<OperationalAerodromeResponseDTO> {
    // TODO: obter deletedBy do contexto autenticado
    return this.service.execute({
      id: params.operationalAerodromeId,
      deletedBy: 'system',
    });
  }
}
