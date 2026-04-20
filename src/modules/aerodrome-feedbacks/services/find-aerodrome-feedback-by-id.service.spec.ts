import { AerodromeFeedbackRepository } from '../repositories/aerodrome-feedback.repository';
import { FindAerodromeFeedbackByIdService } from './find-aerodrome-feedback-by-id.service';

describe('FindAerodromeFeedbackByIdService', () => {
  let service: FindAerodromeFeedbackByIdService;

  beforeEach(() => {
    const repo = {} as unknown as AerodromeFeedbackRepository;
    service = new FindAerodromeFeedbackByIdService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
