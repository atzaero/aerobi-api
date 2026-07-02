import { ContactMessageStatus, ContactType } from '@/generated/prisma/client';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';

import type { IContactRepository } from '../repositories/contact.repository.interface';
import { buildContactFixture } from '../testing/contact.fixture';
import { ListContactsService } from './list-contacts.service';

describe('ListContactsService', () => {
  let service: ListContactsService;
  let findMany: jest.Mock;
  let count: jest.Mock;

  beforeEach(() => {
    findMany = jest.fn();
    count = jest.fn();
    const repo = { findMany, count } as unknown as IContactRepository;
    service = new ListContactsService(repo, new ErrorMessageService());
  });

  it('retorna página paginada com itens mapeados', async () => {
    const row = buildContactFixture();
    findMany.mockResolvedValue([row]);
    count.mockResolvedValue(1);

    const result = await service.execute({
      page: 1,
      limit: 20,
      status: ContactMessageStatus.pending,
      type: ContactType.question,
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      id: row.id,
      email: row.email,
      status: ContactMessageStatus.pending,
    });
    expect(result.data[0]).not.toHaveProperty('deleted');
    expect(result.meta.currentPage).toBe(1);
    expect(result.meta.itemsPerPage).toBe(20);
    expect(result.meta.totalItems).toBe(1);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        status: ContactMessageStatus.pending,
        type: ContactType.question,
      }),
      0,
      20,
    );
  });

  it('rejeita intervalo de datas inválido', async () => {
    await expect(
      service.execute({
        startDate: '2026-06-30',
        endDate: '2026-06-01',
      }),
    ).rejects.toMatchObject({
      status: 400,
    });
    expect(findMany).not.toHaveBeenCalled();
  });
});
