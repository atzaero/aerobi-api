import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { UpdateTechnicalVisitDocs } from '../docs/update-technical-visit.docs';
import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import { UpdateTechnicalVisitDTO } from '../dtos/update-technical-visit.dto';
import { UpdateTechnicalVisitService } from '../services/update-technical-visit.service';

@ApiTags('Technical Visits')
@Controller('technical-visits')
@UseGuards(AerobiApiKeyGuard)
export class UpdateTechnicalVisitController {
  constructor(private readonly service: UpdateTechnicalVisitService) {}

  @Patch(':id')
  @UpdateTechnicalVisitDocs()
  handle(
    @Param('id') id: string,
    @Body() dto: UpdateTechnicalVisitDTO,
  ): Promise<TechnicalVisitResponseDTO> {
    return this.service.execute({ id, ...dto });
  }
}
