import { CreateAerodromeFeedbackService } from '../services/create-aerodrome-feedback.service';
import { CreateAerodromeFeedbackController } from './create-aerodrome-feedback.controller';

describe('CreateAerodromeFeedbackController', () => {
  let controller: CreateAerodromeFeedbackController;
  let service: jest.Mocked<Pick<CreateAerodromeFeedbackService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new CreateAerodromeFeedbackController(
      service as unknown as CreateAerodromeFeedbackService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
