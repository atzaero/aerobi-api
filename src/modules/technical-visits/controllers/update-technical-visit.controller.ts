import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { UpdateTechnicalVisitDocs } from '../docs/update-technical-visit.docs';
import { TechnicalVisitParamDTO } from '../dtos/technical-visit-param.dto';
import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import { UpdateTechnicalVisitDTO } from '../dtos/update-technical-visit.dto';
import { UpdateTechnicalVisitService } from '../services/update-technical-visit.service';

@ApiTags('Technical Visits')
@Controller('technical-visits')
@UseGuards(AerobiApiKeyGuard)
export class UpdateTechnicalVisitController {
  constructor(private readonly service: UpdateTechnicalVisitService) {}

  @Patch(':technicalVisitId')
  @UpdateTechnicalVisitDocs()
  handle(
    @Param() params: TechnicalVisitParamDTO,
    @Body() dto: UpdateTechnicalVisitDTO,
  ): Promise<TechnicalVisitResponseDTO> {
    return this.service.execute({ id: params.technicalVisitId, ...dto });
  }
}
