import { Body, Controller, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { UpdateContactStatusDocs } from '../docs/update-contact-status.docs';
import {
  ContactIdResponseDTO,
  ContactParamDTO,
  UpdateContactStatusDTO,
} from '../dtos/update-contact-status.dto';
import { UpdateContactStatusService } from '../services/update-contact-status.service';

@ApiTags('Contact')
@Controller('contact')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UpdateContactStatusController {
  constructor(private readonly service: UpdateContactStatusService) {}

  @UpdateContactStatusDocs()
  @RequirePermission('contact', 'update')
  handle(
    @Param() params: ContactParamDTO,
    @Body() dto: UpdateContactStatusDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<ContactIdResponseDTO> {
    return this.service.execute(params.id, dto, actor);
  }
}
