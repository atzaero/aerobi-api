import type { Request } from 'express';

import type { PasswordResetResponseDto } from '../dtos/password-reset-response.dto';
import type { RequestPasswordResetDto } from '../dtos/request-password-reset.dto';
import type { RequestPasswordResetService } from '../services/request-password-reset.service';

import { RequestPasswordResetController } from './request-password-reset.controller';

function buildRequest(overrides?: Partial<Request>): Request {
  return {
    headers: overrides?.headers ?? {},
    ip: overrides?.ip ?? '198.51.100.7',
  } as unknown as Request;
}

describe('RequestPasswordResetController', () => {
  let controller: RequestPasswordResetController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new RequestPasswordResetController({
      execute,
    } as unknown as RequestPasswordResetService);
  });

  it('passa body + ipAddress ao service (fallback para request.ip)', async () => {
    const dto: RequestPasswordResetDto = { email: 'u@aerobi.local' };
    const result: PasswordResetResponseDto = { message: 'ok' };
    execute.mockResolvedValue(result);

    await expect(controller.handle(dto, buildRequest())).resolves.toBe(result);
    expect(execute).toHaveBeenCalledWith({
      ...dto,
      ipAddress: '198.51.100.7',
    });
  });

  it('prioriza X-Forwarded-For sobre request.ip', async () => {
    const dto: RequestPasswordResetDto = { email: 'u@aerobi.local' };
    execute.mockResolvedValue({ message: 'ok' });

    await controller.handle(
      dto,
      buildRequest({
        headers: { 'x-forwarded-for': '203.0.113.42, 10.0.0.1' },
      }),
    );
    expect(execute).toHaveBeenCalledWith({
      ...dto,
      ipAddress: '203.0.113.42',
    });
  });
});
