import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Public } from '@/modules/auth/decorators/public.decorator';

import { PublicMaintenanceRateLimitGuard } from '../../guards/public-maintenance-rate-limit.guard';

import { CreatePublicMaintenanceGuessDocs } from '../../docs/create-public-maintenance-guess.docs';
import { MaintenanceParamDTO } from '../../dtos/maintenance-param.dto';
import {
  CreatePublicGuessDTO,
  CreatePublicGuessResponseDTO,
} from '../../dtos/public/create-public-guess.dto';
import { CreatePublicMaintenanceGuessService } from '../../services/create-public-maintenance-guess.service';

@ApiTags('Public Maintenances')
@Controller('public/maintenances')
@UseGuards(PublicMaintenanceRateLimitGuard)
export class CreatePublicMaintenanceGuessController {
  constructor(private readonly service: CreatePublicMaintenanceGuessService) {}

  @Post(':id/guesses')
  @Public()
  @CreatePublicMaintenanceGuessDocs()
  handle(
    @Param() { id }: MaintenanceParamDTO,
    @Body() dto: CreatePublicGuessDTO,
  ): Promise<CreatePublicGuessResponseDTO> {
    return this.service.execute(id, dto);
  }
}
