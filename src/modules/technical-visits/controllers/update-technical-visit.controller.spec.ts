import { UpdateTechnicalVisitService } from '../services/update-technical-visit.service';
import { UpdateTechnicalVisitController } from './update-technical-visit.controller';

describe('UpdateTechnicalVisitController', () => {
  let controller: UpdateTechnicalVisitController;
  let service: jest.Mocked<Pick<UpdateTechnicalVisitService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new UpdateTechnicalVisitController(
      service as unknown as UpdateTechnicalVisitService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
