import { AerodromeFeedbackRepository } from '../repositories/aerodrome-feedback.repository';
import { ListAerodromeFeedbacksService } from './list-aerodrome-feedbacks.service';

describe('ListAerodromeFeedbacksService', () => {
  let service: ListAerodromeFeedbacksService;

  beforeEach(() => {
    const repo = {} as unknown as AerodromeFeedbackRepository;
    service = new ListAerodromeFeedbacksService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
