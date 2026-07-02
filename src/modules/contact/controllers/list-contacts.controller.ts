import { Controller, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';

import { ListContactsDocs } from '../docs/list-contacts.docs';
import { ContactsPaginatedResponseDTO } from '../dtos/contacts-paginated-response.dto';
import { ListContactsQueryDTO } from '../dtos/list-contacts-query.dto';
import { ListContactsService } from '../services/list-contacts.service';

@ApiTags('Contact')
@Controller('contact')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ListContactsController {
  constructor(private readonly service: ListContactsService) {}

  @ListContactsDocs()
  @RequirePermission('contact', 'list')
  handle(
    @Query() query: ListContactsQueryDTO,
  ): Promise<ContactsPaginatedResponseDTO> {
    return this.service.execute(query);
  }
}
