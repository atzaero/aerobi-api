import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { RemoveTechnicalVisitDocs } from '../docs/remove-technical-visit.docs';
import { TechnicalVisitParamDTO } from '../dtos/technical-visit-param.dto';
import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import { RemoveTechnicalVisitService } from '../services/remove-technical-visit.service';

@ApiTags('Technical Visits')
@Controller('technical-visits')
@UseGuards(AerobiApiKeyGuard)
export class RemoveTechnicalVisitController {
  constructor(private readonly service: RemoveTechnicalVisitService) {}

  @Delete(':technicalVisitId')
  @RemoveTechnicalVisitDocs()
  handle(
    @Param() params: TechnicalVisitParamDTO,
  ): Promise<TechnicalVisitResponseDTO> {
    // TODO: obter deletedBy do contexto autenticado
    return this.service.execute({
      id: params.technicalVisitId,
      deletedBy: 'system',
    });
  }
}
