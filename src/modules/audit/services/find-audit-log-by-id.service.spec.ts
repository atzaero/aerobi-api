import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import type { AuditLogRepository } from '../repositories/audit-log.repository';
import { buildAuditLogFixture } from '../testing/audit-log.fixtures';

import { FindAuditLogByIdService } from './find-audit-log-by-id.service';

describe('FindAuditLogByIdService', () => {
  let findById: jest.Mock;
  let service: FindAuditLogByIdService;

  beforeEach(() => {
    findById = jest.fn();
    service = new FindAuditLogByIdService(
      { findById } as unknown as AuditLogRepository,
      new ErrorMessageService(),
    );
  });

  it('retorna o log mapeado (createdAt em ISO)', async () => {
    const log = buildAuditLogFixture({ id: 'a-1' });
    findById.mockResolvedValue(log);

    const res = await service.execute('a-1');

    expect(res.id).toBe('a-1');
    expect(res.createdAt).toBe(log.createdAt.toISOString());
  });

  it('inexistente → 404 RESOURCE_NOT_FOUND', async () => {
    findById.mockResolvedValue(null);

    await expect(service.execute('ghost')).rejects.toBeInstanceOf(
      CustomHttpException,
    );
    await service
      .execute('ghost')
      .catch((e) =>
        expect((e as CustomHttpException).getErrorCode()).toBe(
          ErrorCode.RESOURCE_NOT_FOUND,
        ),
      );
  });
});
