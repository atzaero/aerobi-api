import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { CreateAerodromeDocs } from '../docs/create-aerodrome.docs';
import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import { CreateAerodromeDTO } from '../dtos/create-aerodrome.dto';
import { CreateAerodromeService } from '../services/create-aerodrome.service';

@ApiTags('Aerodromes')
@Controller('aerodromes')
@UseGuards(AerobiApiKeyGuard)
export class CreateAerodromeController {
  constructor(private readonly service: CreateAerodromeService) {}

  @Post()
  @CreateAerodromeDocs()
  handle(@Body() dto: CreateAerodromeDTO): Promise<AerodromeResponseDTO> {
    return this.service.execute(dto);
  }
}
