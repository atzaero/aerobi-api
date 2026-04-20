import { RemoveAerodromeFeedbackService } from '../services/remove-aerodrome-feedback.service';
import { RemoveAerodromeFeedbackController } from './remove-aerodrome-feedback.controller';

describe('RemoveAerodromeFeedbackController', () => {
  let controller: RemoveAerodromeFeedbackController;
  let service: jest.Mocked<Pick<RemoveAerodromeFeedbackService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new RemoveAerodromeFeedbackController(
      service as unknown as RemoveAerodromeFeedbackService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
