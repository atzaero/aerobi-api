import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { UpdateOperationalAerodromeDocs } from '../docs/update-operational-aerodrome.docs';
import { OperationalAerodromeResponseDTO } from '../dtos/operational-aerodrome-response.dto';
import { UpdateOperationalAerodromeDTO } from '../dtos/update-operational-aerodrome.dto';
import { UpdateOperationalAerodromeService } from '../services/update-operational-aerodrome.service';

@ApiTags('Operational Aerodromes')
@Controller('operational-aerodromes')
@UseGuards(AerobiApiKeyGuard)
export class UpdateOperationalAerodromeController {
  constructor(private readonly service: UpdateOperationalAerodromeService) {}

  @Patch(':id')
  @UpdateOperationalAerodromeDocs()
  handle(
    @Param('id') id: string,
    @Body() dto: UpdateOperationalAerodromeDTO,
  ): Promise<OperationalAerodromeResponseDTO> {
    return this.service.execute({ id, ...dto });
  }
}
