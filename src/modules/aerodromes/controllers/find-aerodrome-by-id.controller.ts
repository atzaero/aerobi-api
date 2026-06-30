import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { FindAerodromeByIdDocs } from '../docs/find-aerodrome-by-id.docs';
import { AerodromeParamDTO } from '../dtos/aerodrome-param.dto';
import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import { FindAerodromeByIdService } from '../services/find-aerodrome-by-id.service';

@ApiTags('Aerodromes')
@Controller('aerodromes')
@UseGuards(AerobiApiKeyGuard)
export class FindAerodromeByIdController {
  constructor(private readonly service: FindAerodromeByIdService) {}

  @Get(':aerodromeId')
  @FindAerodromeByIdDocs()
  handle(@Param() params: AerodromeParamDTO): Promise<AerodromeResponseDTO> {
    return this.service.execute({ id: params.aerodromeId });
  }
}
