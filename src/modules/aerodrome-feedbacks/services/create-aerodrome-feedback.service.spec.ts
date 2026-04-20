import { AerodromeFeedbackRepository } from '../repositories/aerodrome-feedback.repository';
import { CreateAerodromeFeedbackService } from './create-aerodrome-feedback.service';

describe('CreateAerodromeFeedbackService', () => {
  let service: CreateAerodromeFeedbackService;

  beforeEach(() => {
    const repo = {} as unknown as AerodromeFeedbackRepository;
    service = new CreateAerodromeFeedbackService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
