import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';
import { buildAuditContext } from '@/modules/audit/utils/audit-context.util';

import { CreateLandingRequestDocs } from '../docs/create-landing-request.docs';
import { CreateLandingRequestDTO } from '../dtos/create-landing-request.dto';
import { CreateLandingRequestResponseDTO } from '../dtos/create-landing-request-response.dto';
import { CreateLandingRequestService } from '../services/create-landing-request.service';

/**
 * `POST /landing-requests` — envio **público** (X-API-Key). Sem RBAC; a
 * auditoria registra com ator nulo (`source: 'public'`).
 */
@ApiTags('Landing Requests')
@Controller('landing-requests')
@UseGuards(AerobiApiKeyGuard)
export class CreateLandingRequestController {
  constructor(private readonly service: CreateLandingRequestService) {}

  @Post()
  @CreateLandingRequestDocs()
  handle(
    @Body() dto: CreateLandingRequestDTO,
    @Req() request: Request,
  ): Promise<CreateLandingRequestResponseDTO> {
    return this.service.execute(dto, buildAuditContext(undefined, request));
  }
}
