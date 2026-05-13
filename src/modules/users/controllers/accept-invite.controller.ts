import { Body, Controller, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { extractIpAddress } from '@/common/utils/extract-ip-address.util';

import { AcceptInviteDocs } from '../docs/accept-invite.docs';
import { AcceptInviteRequestDto } from '../dtos/accept-invite-request.dto';
import { AcceptInviteResponseDto } from '../dtos/accept-invite-response.dto';
import { AcceptInviteService } from '../services/accept-invite.service';

@ApiTags('Users')
@Controller('users')
export class AcceptInviteController {
  constructor(private readonly service: AcceptInviteService) {}

  @AcceptInviteDocs()
  handle(
    @Body() dto: AcceptInviteRequestDto,
    @Req() request: Request,
  ): Promise<AcceptInviteResponseDto> {
    return this.service.execute({
      ...dto,
      userAgent: request.headers['user-agent'],
      ipAddress: extractIpAddress(request),
    });
  }
}
