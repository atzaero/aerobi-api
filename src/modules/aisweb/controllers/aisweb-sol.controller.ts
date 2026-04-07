import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { SolQueryDto } from '../dtos/sol-query.dto';
import { SolResponseDto } from '../dtos/sol-response.dto';
import { AiswebSolService } from '../services/aisweb-sol.service';

@ApiTags('AISWEB')
@ApiSecurity('api_key')
@Controller('aisweb')
@UseGuards(AerobiApiKeyGuard)
export class AiswebSolController {
  constructor(private readonly sol: AiswebSolService) {}

  @Get('sol')
  handle(@Query() query: SolQueryDto): Promise<SolResponseDto> {
    return this.sol.execute(query);
  }
}
