import { ListTechnicalVisitsService } from '../services/list-technical-visits.service';
import { ListTechnicalVisitsController } from './list-technical-visits.controller';

describe('ListTechnicalVisitsController', () => {
  let controller: ListTechnicalVisitsController;
  let service: jest.Mocked<Pick<ListTechnicalVisitsService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new ListTechnicalVisitsController(
      service as unknown as ListTechnicalVisitsService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
