import { Controller, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { RemoveContactDocs } from '../docs/remove-contact.docs';
import {
  ContactIdResponseDTO,
  ContactParamDTO,
} from '../dtos/update-contact-status.dto';
import { RemoveContactService } from '../services/remove-contact.service';

@ApiTags('Contact')
@Controller('contact')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RemoveContactController {
  constructor(private readonly service: RemoveContactService) {}

  @RemoveContactDocs()
  @RequirePermission('contact', 'delete')
  handle(
    @Param() params: ContactParamDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<ContactIdResponseDTO> {
    return this.service.execute(params.id, actor);
  }
}
