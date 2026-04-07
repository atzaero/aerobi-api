import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { RotaerQueryDto } from '../dtos/rotaer-query.dto';
import { AiswebRotaerService } from '../services/aisweb-rotaer.service';

@ApiTags('AISWEB')
@ApiSecurity('api_key')
@Controller('aisweb')
@UseGuards(AerobiApiKeyGuard)
export class AiswebRotaerController {
  constructor(private readonly rotaer: AiswebRotaerService) {}

  @Get('rotaer')
  handle(@Query() query: RotaerQueryDto): Promise<Record<string, unknown>> {
    return this.rotaer.execute(query);
  }
}
