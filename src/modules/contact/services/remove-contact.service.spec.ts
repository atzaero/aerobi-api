import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';

import type { IContactRepository } from '../repositories/contact.repository.interface';
import { buildContactFixture } from '../testing/contact.fixture';
import { RemoveContactService } from './remove-contact.service';

describe('RemoveContactService', () => {
  let service: RemoveContactService;
  let findByIdActive: jest.Mock;
  let softDelete: jest.Mock;

  const actor = {
    id: 'actor-1',
    email: 'admin@aerobi.com.br',
    role: 'ADMIN' as const,
  };

  beforeEach(() => {
    findByIdActive = jest.fn();
    softDelete = jest.fn();
    const repo = {
      findByIdActive,
      softDelete,
    } as unknown as IContactRepository;
    service = new RemoveContactService(repo, new ErrorMessageService());
  });

  it('soft-deleta mensagem ativa', async () => {
    const id = buildContactFixture().id;
    findByIdActive.mockResolvedValue(buildContactFixture());
    softDelete.mockResolvedValue(
      buildContactFixture({ deletedAt: new Date() }),
    );

    const result = await service.execute(id, actor);

    expect(result).toEqual({ id });
    expect(softDelete).toHaveBeenCalledWith(id, actor.id);
  });

  it('404 quando mensagem não existe ou já foi removida', async () => {
    findByIdActive.mockResolvedValue(null);

    await expect(
      service.execute('11111111-1111-4111-8111-111111111111', actor),
    ).rejects.toMatchObject({
      errorCode: ErrorCode.RESOURCE_NOT_FOUND,
    });
    expect(softDelete).not.toHaveBeenCalled();
  });
});
