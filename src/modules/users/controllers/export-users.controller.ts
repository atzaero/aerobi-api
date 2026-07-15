import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { applyCsvDownloadHeaders } from '@/common/utils/csv-download.util';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ExportUsersDocs } from '../docs/export-users.docs';
import { ExportUsersQueryDto } from '../dtos/export-users-query.dto';
import { ExportUsersService } from '../services/export-users.service';

/**
 * `GET /users/export`. Deve ser registrado **antes** do `FindUserByIdController`
 * no módulo, senão a rota cai no handler de `:id` (e `export` falha a validação
 * de UUID).
 */
@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExportUsersController {
  constructor(private readonly service: ExportUsersService) {}

  @Get('export')
  @RequirePermission('user', 'export')
  @ExportUsersDocs()
  async handle(
    @Query() query: ExportUsersQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const { csv, truncated, total } = await this.service.execute(query, actor);
    applyCsvDownloadHeaders(res, 'users.csv', { truncated, total });
    return csv;
  }
}
