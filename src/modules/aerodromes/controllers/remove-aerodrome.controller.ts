import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { RemoveAerodromeDocs } from '../docs/remove-aerodrome.docs';
import { AerodromeParamDTO } from '../dtos/aerodrome-param.dto';
import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import { RemoveAerodromeService } from '../services/remove-aerodrome.service';

@ApiTags('Aerodromes')
@Controller('aerodromes')
@UseGuards(AerobiApiKeyGuard)
export class RemoveAerodromeController {
  constructor(private readonly service: RemoveAerodromeService) {}

  @Delete(':aerodromeId')
  @RemoveAerodromeDocs()
  handle(@Param() params: AerodromeParamDTO): Promise<AerodromeResponseDTO> {
    // TODO: obter deletedBy do contexto autenticado
    return this.service.execute({
      id: params.aerodromeId,
      deletedBy: 'system',
    });
  }
}
