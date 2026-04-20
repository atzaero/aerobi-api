import { RemoveTechnicalVisitService } from '../services/remove-technical-visit.service';
import { RemoveTechnicalVisitController } from './remove-technical-visit.controller';

describe('RemoveTechnicalVisitController', () => {
  let controller: RemoveTechnicalVisitController;
  let service: jest.Mocked<Pick<RemoveTechnicalVisitService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new RemoveTechnicalVisitController(
      service as unknown as RemoveTechnicalVisitService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
