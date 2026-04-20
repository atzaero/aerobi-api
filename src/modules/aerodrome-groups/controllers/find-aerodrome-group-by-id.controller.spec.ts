import { FindAerodromeGroupByIdService } from '../services/find-aerodrome-group-by-id.service';
import { FindAerodromeGroupByIdController } from './find-aerodrome-group-by-id.controller';

describe('FindAerodromeGroupByIdController', () => {
  let controller: FindAerodromeGroupByIdController;
  let service: jest.Mocked<Pick<FindAerodromeGroupByIdService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new FindAerodromeGroupByIdController(
      service as unknown as FindAerodromeGroupByIdService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
