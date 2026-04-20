import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { FindTechnicalVisitByIdDocs } from '../docs/find-technical-visit-by-id.docs';
import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import { FindTechnicalVisitByIdService } from '../services/find-technical-visit-by-id.service';

@ApiTags('Technical Visits')
@Controller('technical-visits')
@UseGuards(AerobiApiKeyGuard)
export class FindTechnicalVisitByIdController {
  constructor(private readonly service: FindTechnicalVisitByIdService) {}

  @Get(':id')
  @FindTechnicalVisitByIdDocs()
  handle(@Param('id') id: string): Promise<TechnicalVisitResponseDTO> {
    return this.service.execute({ id });
  }
}
