import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { AiswebSolDocs } from '../docs/aisweb-sol.docs';
import { SolQueryDto } from '../dtos/sol-query.dto';
import { SolResponseDto } from '../dtos/sol-response.dto';
import { AiswebSolService } from '../services/aisweb-sol.service';

@ApiTags('AISWEB')
@Controller('aisweb')
@UseGuards(AerobiApiKeyGuard)
export class AiswebSolController {
  constructor(private readonly sol: AiswebSolService) {}

  @Get('sol')
  @AiswebSolDocs()
  handle(@Query() query: SolQueryDto): Promise<SolResponseDto> {
    return this.sol.execute(query);
  }
}
