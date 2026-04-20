import { ListAerodromeFeedbacksService } from '../services/list-aerodrome-feedbacks.service';
import { ListAerodromeFeedbacksController } from './list-aerodrome-feedbacks.controller';

describe('ListAerodromeFeedbacksController', () => {
  let controller: ListAerodromeFeedbacksController;
  let service: jest.Mocked<Pick<ListAerodromeFeedbacksService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new ListAerodromeFeedbacksController(
      service as unknown as ListAerodromeFeedbacksService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
