import { ContactMessageStatus } from '@/generated/prisma/client';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';

import type { IContactRepository } from '../repositories/contact.repository.interface';
import { buildContactFixture } from '../testing/contact.fixture';
import { UpdateContactStatusService } from './update-contact-status.service';

describe('UpdateContactStatusService', () => {
  let service: UpdateContactStatusService;
  let findByIdActive: jest.Mock;
  let updateStatus: jest.Mock;

  const actor = {
    id: 'actor-1',
    email: 'admin@aerobi.com.br',
    role: 'ADMIN' as const,
  };

  beforeEach(() => {
    findByIdActive = jest.fn();
    updateStatus = jest.fn();
    const repo = {
      findByIdActive,
      updateStatus,
    } as unknown as IContactRepository;
    service = new UpdateContactStatusService(repo, new ErrorMessageService());
  });

  it('no-op quando status já é o mesmo', async () => {
    const id = buildContactFixture().id;
    findByIdActive.mockResolvedValue(
      buildContactFixture({ status: ContactMessageStatus.resolved }),
    );

    const result = await service.execute(
      id,
      { status: ContactMessageStatus.resolved },
      actor,
    );

    expect(result).toEqual({ id });
    expect(updateStatus).not.toHaveBeenCalled();
  });

  it('404 quando mensagem não existe', async () => {
    findByIdActive.mockResolvedValue(null);
    await expect(
      service.execute(
        '11111111-1111-4111-8111-111111111111',
        { status: ContactMessageStatus.resolved },
        actor,
      ),
    ).rejects.toMatchObject({
      errorCode: ErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});
