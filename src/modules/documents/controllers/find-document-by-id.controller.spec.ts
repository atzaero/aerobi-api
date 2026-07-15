import { DocumentParamDTO } from '../dtos/document-param.dto';
import { DocumentResponseDTO } from '../dtos/document-response.dto';
import type { FindDocumentByIdService } from '../services/find-document-by-id.service';

import { FindDocumentByIdController } from './find-document-by-id.controller';

describe('FindDocumentByIdController', () => {
  let controller: FindDocumentByIdController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new FindDocumentByIdController({
      execute,
    } as unknown as FindDocumentByIdService);
  });

  it('delega o id do param', async () => {
    const params: DocumentParamDTO = {
      id: '11111111-1111-4111-8111-111111111111',
    };
    const row = new DocumentResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({ id: params.id });
  });
});
