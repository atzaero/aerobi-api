import type { EventEmitter2 } from '@nestjs/event-emitter';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';

import { CONTACT_CREATED_EVENT } from '../events/contact-created.event';
import type { IContactRepository } from '../repositories/contact.repository.interface';
import { buildContactFixture } from '../testing/contact.fixture';
import { buildCreateContactDto } from '../testing/create-contact.dto.fixture';
import type { EvaluateContactSubmissionGuardsService } from './evaluate-contact-submission-guards.service';
import { CreateContactService } from './create-contact.service';

describe('CreateContactService', () => {
  let service: CreateContactService;
  let repo: jest.Mocked<Pick<IContactRepository, 'create' | 'hardDelete'>>;
  let guardsService: jest.Mocked<
    Pick<EvaluateContactSubmissionGuardsService, 'execute'>
  >;
  let emitAsync: jest.Mock;

  beforeEach(() => {
    repo = {
      create: jest.fn(),
      hardDelete: jest.fn(),
    };
    guardsService = { execute: jest.fn() };
    emitAsync = jest.fn();
    const eventEmitter = { emitAsync } as unknown as EventEmitter2;
    service = new CreateContactService(
      repo as unknown as IContactRepository,
      guardsService as unknown as EvaluateContactSubmissionGuardsService,
      eventEmitter,
      new ErrorMessageService(),
    );
  });

  it('retorna null quando guards suprimem', async () => {
    guardsService.execute.mockResolvedValue({
      suppressed: true,
      date: '2026-06-30',
      ipHash: null,
      normalizedEmail: 'user@example.com',
    });

    const result = await service.execute(buildCreateContactDto(), '1.2.3.4');

    expect(result).toBeNull();
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('persiste e retorna id quando e-mail é enviado', async () => {
    const saved = buildContactFixture();
    guardsService.execute.mockResolvedValue({
      suppressed: false,
      date: '2026-06-30',
      ipHash: 'hash',
      normalizedEmail: 'user@example.com',
    });
    repo.create.mockResolvedValue(saved);
    emitAsync.mockResolvedValue([true]);

    const result = await service.execute(buildCreateContactDto(), '1.2.3.4');

    expect(result).toEqual({ id: saved.id });
    expect(emitAsync).toHaveBeenCalledWith(
      CONTACT_CREATED_EVENT,
      expect.objectContaining({ contactId: saved.id }),
    );
  });

  it('faz rollback e lança EMAIL_SEND_FAILED quando e-mail falha', async () => {
    const saved = buildContactFixture();
    guardsService.execute.mockResolvedValue({
      suppressed: false,
      date: '2026-06-30',
      ipHash: null,
      normalizedEmail: 'user@example.com',
    });
    repo.create.mockResolvedValue(saved);
    emitAsync.mockResolvedValue([false]);

    await expect(
      service.execute(buildCreateContactDto(), undefined),
    ).rejects.toMatchObject({
      errorCode: ErrorCode.EMAIL_SEND_FAILED,
    });
    expect(repo.hardDelete).toHaveBeenCalledWith(saved.id);
  });

  it('lança EMAIL_SEND_FAILED mesmo quando rollback falha', async () => {
    const saved = buildContactFixture();
    guardsService.execute.mockResolvedValue({
      suppressed: false,
      date: '2026-06-30',
      ipHash: null,
      normalizedEmail: 'user@example.com',
    });
    repo.create.mockResolvedValue(saved);
    emitAsync.mockResolvedValue([false]);
    repo.hardDelete.mockRejectedValue(new Error('db down'));

    await expect(
      service.execute(buildCreateContactDto(), undefined),
    ).rejects.toMatchObject({
      errorCode: ErrorCode.EMAIL_SEND_FAILED,
    });
    expect(repo.hardDelete).toHaveBeenCalledWith(saved.id);
  });

  it('faz rollback e lança EMAIL_SEND_FAILED quando emitAsync rejeita', async () => {
    const saved = buildContactFixture();
    guardsService.execute.mockResolvedValue({
      suppressed: false,
      date: '2026-06-30',
      ipHash: null,
      normalizedEmail: 'user@example.com',
    });
    repo.create.mockResolvedValue(saved);
    emitAsync.mockRejectedValue(new Error('listener crash'));

    await expect(
      service.execute(buildCreateContactDto(), undefined),
    ).rejects.toMatchObject({
      errorCode: ErrorCode.EMAIL_SEND_FAILED,
    });
    expect(repo.hardDelete).toHaveBeenCalledWith(saved.id);
  });
});
