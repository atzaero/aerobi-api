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

import { LoginRequestDto } from '../dtos/login-request.dto';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { AuthLoginService } from '../services/auth-login.service';
import { AuthResponseMapperService } from '../services/auth-response-mapper.service';

@ApiTags('Auth')
@Controller('auth')
export class LoginController {
  constructor(
    private readonly authLoginService: AuthLoginService,
    private readonly mapper: AuthResponseMapperService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login com email e senha',
    description:
      'Emite um par fresco de access + refresh tokens JWT RS256. ' +
      'O refresh é persistido (hash SHA-256); o plain volta uma única vez.',
  })
  @ApiBody({ type: LoginRequestDto })
  @ApiResponse({ status: HttpStatus.OK, type: LoginResponseDto })
  @ApiUnauthorizedResponse({
    description:
      'Credenciais inválidas / conta não ativada / não verificada / removida.',
  })
  async handle(
    @Body() dto: LoginRequestDto,
    @Req() request: Request,
  ): Promise<LoginResponseDto> {
    const result = await this.authLoginService.execute({
      email: dto.email,
      password: dto.password,
      context: {
        userAgent: request.headers['user-agent'],
        ipAddress: extractIpAddress(request),
      },
    });
    return this.mapper.toLoginResponse(result);
  }
}

function extractIpAddress(request: Request): string | undefined {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim();
  }
  return request.ip;
}
