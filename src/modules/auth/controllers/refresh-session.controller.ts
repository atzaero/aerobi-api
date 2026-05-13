import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';

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

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rotaciona refresh token e emite par novo',
    description:
      'Rotação encadeada com `jti` único. Apresentar um refresh já ' +
      'revogado dispara revogação de toda a família (proteção contra reuso).',
  })
  @ApiBody({ type: RefreshRequestDto })
  @ApiResponse({ status: HttpStatus.OK, type: RefreshResponseDto })
  @ApiUnauthorizedResponse({
    description: 'Refresh inválido / expirado / revogado / reuso detectado.',
  })
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

function extractIpAddress(request: Request): string | undefined {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim();
  }
  return request.ip;
}
