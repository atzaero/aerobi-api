import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { RemoveTechnicalVisitDocs } from '../docs/remove-technical-visit.docs';
import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import { RemoveTechnicalVisitService } from '../services/remove-technical-visit.service';

@ApiTags('Technical Visits')
@Controller('technical-visits')
@UseGuards(AerobiApiKeyGuard)
export class RemoveTechnicalVisitController {
  constructor(private readonly service: RemoveTechnicalVisitService) {}

  @Delete(':id')
  @RemoveTechnicalVisitDocs()
  handle(@Param('id') id: string): Promise<TechnicalVisitResponseDTO> {
    // TODO: obter deletedBy do contexto autenticado
    return this.service.execute({ id, deletedBy: 'system' });
  }
}
