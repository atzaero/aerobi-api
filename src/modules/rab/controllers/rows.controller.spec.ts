import type { RabRowsFindAllQueryDTO } from '../dtos/rab-rows-find-all-query.dto';
import type { RabRowsPaginatedResponseDTO } from '../dtos/rab-rows-paginated-response.dto';
import type { RabRowsService } from '../services/rab-rows.service';

import { RowsController } from './rows.controller';

describe('RowsController', () => {
  it('delega ao RabRowsService com a query recebida', async () => {
    const expected = {
      data: [],
      meta: {},
    } as unknown as RabRowsPaginatedResponseDTO;
    const execute = jest.fn().mockResolvedValue(expected);
    const rabRows = { execute } as unknown as RabRowsService;
    const controller = new RowsController(rabRows);
    const query = { page: 1, limit: 10 } as RabRowsFindAllQueryDTO;

    const res = await controller.handle(query);

    expect(execute).toHaveBeenCalledWith(query);
    expect(res).toBe(expected);
  });
});
