import { AerodromeFeedbackRepository } from '../repositories/aerodrome-feedback.repository';
import { RemoveAerodromeFeedbackService } from './remove-aerodrome-feedback.service';

describe('RemoveAerodromeFeedbackService', () => {
  let service: RemoveAerodromeFeedbackService;

  beforeEach(() => {
    const repo = {} as unknown as AerodromeFeedbackRepository;
    service = new RemoveAerodromeFeedbackService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
