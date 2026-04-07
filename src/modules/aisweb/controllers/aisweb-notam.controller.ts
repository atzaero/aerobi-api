import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { NotamQueryDto } from '../dtos/notam-query.dto';
import { NotamResponseDto } from '../dtos/notam-response.dto';
import { AiswebNotamService } from '../services/aisweb-notam.service';

@ApiTags('AISWEB')
@ApiSecurity('api_key')
@Controller('aisweb')
@UseGuards(AerobiApiKeyGuard)
export class AiswebNotamController {
  constructor(private readonly notam: AiswebNotamService) {}

  @Get('notam')
  handle(@Query() query: NotamQueryDto): Promise<NotamResponseDto> {
    return this.notam.execute(query);
  }
}
