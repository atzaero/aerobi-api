import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { CreateTechnicalVisitDocs } from '../docs/create-technical-visit.docs';
import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import { CreateTechnicalVisitDTO } from '../dtos/create-technical-visit.dto';
import { CreateTechnicalVisitService } from '../services/create-technical-visit.service';

@ApiTags('Technical Visits')
@Controller('technical-visits')
@UseGuards(AerobiApiKeyGuard)
export class CreateTechnicalVisitController {
  constructor(private readonly service: CreateTechnicalVisitService) {}

  @Post()
  @CreateTechnicalVisitDocs()
  handle(
    @Body() dto: CreateTechnicalVisitDTO,
  ): Promise<TechnicalVisitResponseDTO> {
    return this.service.execute(dto);
  }
}
