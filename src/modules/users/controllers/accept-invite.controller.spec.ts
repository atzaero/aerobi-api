import type { Request } from 'express';

import type { AcceptInviteRequestDto } from '../dtos/accept-invite-request.dto';
import type { AcceptInviteResponseDto } from '../dtos/accept-invite-response.dto';
import type { AcceptInviteService } from '../services/accept-invite.service';

import { AcceptInviteController } from './accept-invite.controller';

function buildRequest(): Request {
  return {
    headers: { 'user-agent': 'jest', 'x-forwarded-for': '203.0.113.5' },
    ip: '127.0.0.1',
  } as unknown as Request;
}

describe('AcceptInviteController', () => {
  let controller: AcceptInviteController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new AcceptInviteController({
      execute,
    } as unknown as AcceptInviteService);
  });

  it('passa body + userAgent + ipAddress (request.ip) ao service', async () => {
    const dto: AcceptInviteRequestDto = {
      email: 'piloto@aerobi.local',
      token: 'plain-invite-token',
      password: 'NovaSenha123',
    };
    const result = {
      accessToken: 'access',
      refreshToken: 'refresh',
    } as AcceptInviteResponseDto;
    execute.mockResolvedValue(result);

    await expect(controller.handle(dto, buildRequest())).resolves.toBe(result);
    expect(execute).toHaveBeenCalledWith({
      ...dto,
      userAgent: 'jest',
      ipAddress: '127.0.0.1',
    });
  });
});
