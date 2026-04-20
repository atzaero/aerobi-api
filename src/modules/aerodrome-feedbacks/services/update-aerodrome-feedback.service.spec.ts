import { AerodromeFeedbackRepository } from '../repositories/aerodrome-feedback.repository';
import { UpdateAerodromeFeedbackService } from './update-aerodrome-feedback.service';

describe('UpdateAerodromeFeedbackService', () => {
  let service: UpdateAerodromeFeedbackService;

  beforeEach(() => {
    const repo = {} as unknown as AerodromeFeedbackRepository;
    service = new UpdateAerodromeFeedbackService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
