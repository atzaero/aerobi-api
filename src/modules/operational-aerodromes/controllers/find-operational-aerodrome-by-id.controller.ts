import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { FindOperationalAerodromeByIdDocs } from '../docs/find-operational-aerodrome-by-id.docs';
import { OperationalAerodromeResponseDTO } from '../dtos/operational-aerodrome-response.dto';
import { FindOperationalAerodromeByIdService } from '../services/find-operational-aerodrome-by-id.service';

@ApiTags('Operational Aerodromes')
@Controller('operational-aerodromes')
@UseGuards(AerobiApiKeyGuard)
export class FindOperationalAerodromeByIdController {
  constructor(private readonly service: FindOperationalAerodromeByIdService) {}

  @Get(':id')
  @FindOperationalAerodromeByIdDocs()
  handle(@Param('id') id: string): Promise<OperationalAerodromeResponseDTO> {
    return this.service.execute({ id });
  }
}
