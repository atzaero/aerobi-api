import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { FindAerodromeGroupByIdDocs } from '../docs/find-aerodrome-group-by-id.docs';
import { AerodromeGroupParamDTO } from '../dtos/aerodrome-group-param.dto';
import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import { FindAerodromeGroupByIdService } from '../services/find-aerodrome-group-by-id.service';

@ApiTags('Aerodrome Groups')
@Controller('aerodrome-groups')
@UseGuards(AerobiApiKeyGuard)
export class FindAerodromeGroupByIdController {
  constructor(private readonly service: FindAerodromeGroupByIdService) {}

  @Get(':aerodromeGroupId')
  @FindAerodromeGroupByIdDocs()
  handle(
    @Param() params: AerodromeGroupParamDTO,
  ): Promise<AerodromeGroupResponseDTO> {
    return this.service.execute({ id: params.aerodromeGroupId });
  }
}
