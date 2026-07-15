import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Public } from '@/modules/auth/decorators/public.decorator';

import { PublicMaintenanceRateLimitGuard } from '../../guards/public-maintenance-rate-limit.guard';

import { GetPublicMaintenanceFeedbackDocs } from '../../docs/get-public-maintenance-feedback.docs';
import { MaintenanceParamDTO } from '../../dtos/maintenance-param.dto';
import { PublicMaintenanceFeedbackQueryDTO } from '../../dtos/public/public-maintenance-feedback-query.dto';
import { PublicMaintenanceFeedbackResponseDTO } from '../../dtos/public/public-maintenance-feedback-response.dto';
import { GetPublicMaintenanceFeedbackService } from '../../services/get-public-maintenance-feedback.service';

@ApiTags('Public Maintenances')
@Controller('public/maintenances')
@UseGuards(PublicMaintenanceRateLimitGuard)
export class GetPublicMaintenanceFeedbackController {
  constructor(private readonly service: GetPublicMaintenanceFeedbackService) {}

  @Get(':id/feedback')
  @Public()
  @GetPublicMaintenanceFeedbackDocs()
  handle(
    @Param() { id }: MaintenanceParamDTO,
    @Query() query: PublicMaintenanceFeedbackQueryDTO,
  ): Promise<PublicMaintenanceFeedbackResponseDTO> {
    return this.service.execute(id, query);
  }
}
