import { ListPilotLandingsService } from '../services/list-pilot-landings.service';
import { ListPilotLandingsController } from './list-pilot-landings.controller';

describe('ListPilotLandingsController', () => {
  let controller: ListPilotLandingsController;
  let service: jest.Mocked<Pick<ListPilotLandingsService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new ListPilotLandingsController(
      service as unknown as ListPilotLandingsService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
