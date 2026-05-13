import { Body, Controller, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { extractIpAddress } from '@/common/utils/extract-ip-address.util';

import { RequestPasswordResetDocs } from '../docs/request-password-reset.docs';
import { PasswordResetResponseDto } from '../dtos/password-reset-response.dto';
import { RequestPasswordResetDto } from '../dtos/request-password-reset.dto';
import { RequestPasswordResetService } from '../services/request-password-reset.service';

@ApiTags('Users')
@Controller('users')
export class RequestPasswordResetController {
  constructor(private readonly service: RequestPasswordResetService) {}

  @RequestPasswordResetDocs()
  handle(
    @Body() dto: RequestPasswordResetDto,
    @Req() request: Request,
  ): Promise<PasswordResetResponseDto> {
    return this.service.execute({
      ...dto,
      ipAddress: extractIpAddress(request),
    });
  }
}
