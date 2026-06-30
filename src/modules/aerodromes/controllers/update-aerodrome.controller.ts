import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { UpdateAerodromeDocs } from '../docs/update-aerodrome.docs';
import { AerodromeParamDTO } from '../dtos/aerodrome-param.dto';
import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import { UpdateAerodromeDTO } from '../dtos/update-aerodrome.dto';
import { UpdateAerodromeService } from '../services/update-aerodrome.service';

@ApiTags('Aerodromes')
@Controller('aerodromes')
@UseGuards(AerobiApiKeyGuard)
export class UpdateAerodromeController {
  constructor(private readonly service: UpdateAerodromeService) {}

  @Patch(':aerodromeId')
  @UpdateAerodromeDocs()
  handle(
    @Param() params: AerodromeParamDTO,
    @Body() dto: UpdateAerodromeDTO,
  ): Promise<AerodromeResponseDTO> {
    return this.service.execute({ id: params.aerodromeId, ...dto });
  }
}
