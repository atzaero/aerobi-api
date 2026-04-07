import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { AiswebInfotempDocs } from '../docs/aisweb-infotemp.docs';
import { InfotempQueryDto } from '../dtos/infotemp-query.dto';
import { InfotempResponseDto } from '../dtos/infotemp-response.dto';
import { AiswebInfotempService } from '../services/aisweb-infotemp.service';

@ApiTags('AISWEB')
@Controller('aisweb')
@UseGuards(AerobiApiKeyGuard)
export class AiswebInfotempController {
  constructor(private readonly infotemp: AiswebInfotempService) {}

  @Get('infotemp')
  @AiswebInfotempDocs()
  handle(@Query() query: InfotempQueryDto): Promise<InfotempResponseDto> {
    return this.infotemp.execute(query);
  }
}
