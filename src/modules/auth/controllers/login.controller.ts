import { Body, Controller, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { extractIpAddress } from '@/common/utils/extract-ip-address.util';

import { LoginDocs } from '../docs/login.docs';
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

  @LoginDocs()
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
