import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { InfotempQueryDto } from '../dtos/infotemp-query.dto';
import { InfotempResponseDto } from '../dtos/infotemp-response.dto';
import { AiswebInfotempService } from '../services/aisweb-infotemp.service';

@ApiTags('AISWEB')
@ApiSecurity('api_key')
@Controller('aisweb')
@UseGuards(AerobiApiKeyGuard)
export class AiswebInfotempController {
  constructor(private readonly infotemp: AiswebInfotempService) {}

  @Get('infotemp')
  handle(@Query() query: InfotempQueryDto): Promise<InfotempResponseDto> {
    return this.infotemp.execute(query);
  }
}
