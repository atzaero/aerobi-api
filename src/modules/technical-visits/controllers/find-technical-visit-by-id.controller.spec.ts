import { FindTechnicalVisitByIdService } from '../services/find-technical-visit-by-id.service';
import { FindTechnicalVisitByIdController } from './find-technical-visit-by-id.controller';

describe('FindTechnicalVisitByIdController', () => {
  let controller: FindTechnicalVisitByIdController;
  let service: jest.Mocked<Pick<FindTechnicalVisitByIdService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new FindTechnicalVisitByIdController(
      service as unknown as FindTechnicalVisitByIdService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
