import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { UpdateAerodromeGroupDocs } from '../docs/update-aerodrome-group.docs';
import { AerodromeGroupParamDTO } from '../dtos/aerodrome-group-param.dto';
import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import { UpdateAerodromeGroupDTO } from '../dtos/update-aerodrome-group.dto';
import { UpdateAerodromeGroupService } from '../services/update-aerodrome-group.service';

@ApiTags('Aerodrome Groups')
@Controller('aerodrome-groups')
@UseGuards(AerobiApiKeyGuard)
export class UpdateAerodromeGroupController {
  constructor(private readonly service: UpdateAerodromeGroupService) {}

  @Patch(':aerodromeGroupId')
  @UpdateAerodromeGroupDocs()
  handle(
    @Param() params: AerodromeGroupParamDTO,
    @Body() dto: UpdateAerodromeGroupDTO,
  ): Promise<AerodromeGroupResponseDTO> {
    return this.service.execute({ id: params.aerodromeGroupId, ...dto });
  }
}
