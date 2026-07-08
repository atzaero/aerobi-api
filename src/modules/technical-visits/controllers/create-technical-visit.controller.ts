import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { buildAuditContext } from '@/modules/audit/utils/audit-context.util';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { CreateTechnicalVisitDocs } from '../docs/create-technical-visit.docs';
import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import { CreateTechnicalVisitDTO } from '../dtos/create-technical-visit.dto';
import { CreateTechnicalVisitService } from '../services/create-technical-visit.service';

@ApiTags('Technical Visits')
@Controller('technical-visits')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CreateTechnicalVisitController {
  constructor(private readonly service: CreateTechnicalVisitService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission('technical_visit', 'create')
  @CreateTechnicalVisitDocs()
  handle(
    @Body() dto: CreateTechnicalVisitDTO,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<TechnicalVisitResponseDTO> {
    return this.service.execute(dto, actor, buildAuditContext(actor, request));
  }
}
