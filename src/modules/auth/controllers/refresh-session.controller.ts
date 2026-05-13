import { Body, Controller, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { extractIpAddress } from '@/common/utils/extract-ip-address.util';

import { RefreshSessionDocs } from '../docs/refresh-session.docs';
import { RefreshRequestDto } from '../dtos/refresh-request.dto';
import { RefreshResponseDto } from '../dtos/refresh-response.dto';
import { AuthRefreshSessionService } from '../services/auth-refresh-session.service';
import { AuthResponseMapperService } from '../services/auth-response-mapper.service';

@ApiTags('Auth')
@Controller('auth')
export class RefreshSessionController {
  constructor(
    private readonly authRefreshSessionService: AuthRefreshSessionService,
    private readonly mapper: AuthResponseMapperService,
  ) {}

  @RefreshSessionDocs()
  async handle(
    @Body() dto: RefreshRequestDto,
    @Req() request: Request,
  ): Promise<RefreshResponseDto> {
    const result = await this.authRefreshSessionService.execute({
      refreshToken: dto.refreshToken,
      context: {
        userAgent: request.headers['user-agent'],
        ipAddress: extractIpAddress(request),
      },
    });
    return this.mapper.toRefreshResponse(result);
  }
}
