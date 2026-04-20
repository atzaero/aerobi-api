import { CreateTechnicalVisitService } from '../services/create-technical-visit.service';
import { CreateTechnicalVisitController } from './create-technical-visit.controller';

describe('CreateTechnicalVisitController', () => {
  let controller: CreateTechnicalVisitController;
  let service: jest.Mocked<Pick<CreateTechnicalVisitService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new CreateTechnicalVisitController(
      service as unknown as CreateTechnicalVisitService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
