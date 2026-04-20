import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { CreateOperationalAerodromeDocs } from '../docs/create-operational-aerodrome.docs';
import { OperationalAerodromeResponseDTO } from '../dtos/operational-aerodrome-response.dto';
import { CreateOperationalAerodromeDTO } from '../dtos/create-operational-aerodrome.dto';
import { CreateOperationalAerodromeService } from '../services/create-operational-aerodrome.service';

@ApiTags('Operational Aerodromes')
@Controller('operational-aerodromes')
@UseGuards(AerobiApiKeyGuard)
export class CreateOperationalAerodromeController {
  constructor(private readonly service: CreateOperationalAerodromeService) {}

  @Post()
  @CreateOperationalAerodromeDocs()
  handle(
    @Body() dto: CreateOperationalAerodromeDTO,
  ): Promise<OperationalAerodromeResponseDTO> {
    return this.service.execute(dto);
  }
}
