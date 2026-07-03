import { ContactsPaginatedResponseDTO } from '../dtos/contacts-paginated-response.dto';
import type { ListContactsQueryDTO } from '../dtos/list-contacts-query.dto';
import type { ListContactsService } from '../services/list-contacts.service';

import { ListContactsController } from './list-contacts.controller';

describe('ListContactsController', () => {
  let controller: ListContactsController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ListContactsController({
      execute,
    } as unknown as ListContactsService);
  });

  it('delega a query ao service e devolve o resultado', async () => {
    const query: ListContactsQueryDTO = { page: 1, limit: 10 };
    const result = new ContactsPaginatedResponseDTO([], 1, 10, 0);
    execute.mockResolvedValue(result);

    await expect(controller.handle(query)).resolves.toBe(result);
    expect(execute).toHaveBeenCalledWith(query);
  });
});
