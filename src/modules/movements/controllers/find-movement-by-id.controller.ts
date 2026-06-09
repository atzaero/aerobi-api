import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { FindMovementByIdDocs } from '../docs/find-movement-by-id.docs';
import { MovementParamDTO } from '../dtos/movement-param.dto';
import { MovementResponseDTO } from '../dtos/movement-response.dto';
import { FindMovementByIdService } from '../services/find-movement-by-id.service';

@ApiTags('Readings')
@Controller('readings')
@UseGuards(AerobiApiKeyGuard)
export class FindMovementByIdController {
  constructor(private readonly service: FindMovementByIdService) {}

  @Get(':readingId')
  @FindMovementByIdDocs()
  handle(@Param() params: MovementParamDTO): Promise<MovementResponseDTO> {
    return this.service.execute(params.readingId);
  }
}
