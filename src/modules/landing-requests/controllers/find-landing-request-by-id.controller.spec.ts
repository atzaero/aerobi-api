import type { LandingRequestParamDTO } from '../dtos/landing-request-param.dto';
import type { FindLandingRequestByIdService } from '../services/find-landing-request-by-id.service';
import { FindLandingRequestByIdController } from './find-landing-request-by-id.controller';

describe('FindLandingRequestByIdController', () => {
  let controller: FindLandingRequestByIdController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new FindLandingRequestByIdController({
      execute,
    } as unknown as FindLandingRequestByIdService);
  });

  it('delega o id do param ao service', async () => {
    const params: LandingRequestParamDTO = {
      id: '55555555-5555-4555-8555-555555555555',
    };
    const row = { id: params.id };
    execute.mockResolvedValue(row);
    await expect(controller.handle(params)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(params.id);
  });
});
