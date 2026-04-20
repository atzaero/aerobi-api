import { FindAerodromeFeedbackByIdService } from '../services/find-aerodrome-feedback-by-id.service';
import { FindAerodromeFeedbackByIdController } from './find-aerodrome-feedback-by-id.controller';

describe('FindAerodromeFeedbackByIdController', () => {
  let controller: FindAerodromeFeedbackByIdController;
  let service: jest.Mocked<Pick<FindAerodromeFeedbackByIdService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new FindAerodromeFeedbackByIdController(
      service as unknown as FindAerodromeFeedbackByIdService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
