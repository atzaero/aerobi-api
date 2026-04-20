import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { CreateAerodromeGroupDocs } from '../docs/create-aerodrome-group.docs';
import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import { CreateAerodromeGroupDTO } from '../dtos/create-aerodrome-group.dto';
import { CreateAerodromeGroupService } from '../services/create-aerodrome-group.service';

@ApiTags('Aerodrome Groups')
@Controller('aerodrome-groups')
@UseGuards(AerobiApiKeyGuard)
export class CreateAerodromeGroupController {
  constructor(private readonly service: CreateAerodromeGroupService) {}

  @Post()
  @CreateAerodromeGroupDocs()
  handle(
    @Body() dto: CreateAerodromeGroupDTO,
  ): Promise<AerodromeGroupResponseDTO> {
    return this.service.execute(dto);
  }
}
