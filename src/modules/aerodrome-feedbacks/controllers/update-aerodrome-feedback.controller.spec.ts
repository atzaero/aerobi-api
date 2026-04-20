import { UpdateAerodromeFeedbackService } from '../services/update-aerodrome-feedback.service';
import { UpdateAerodromeFeedbackController } from './update-aerodrome-feedback.controller';

describe('UpdateAerodromeFeedbackController', () => {
  let controller: UpdateAerodromeFeedbackController;
  let service: jest.Mocked<Pick<UpdateAerodromeFeedbackService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new UpdateAerodromeFeedbackController(
      service as unknown as UpdateAerodromeFeedbackService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
