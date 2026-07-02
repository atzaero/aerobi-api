import type { IContactRepository } from '../repositories/contact.repository.interface';
import { buildCreateContactDto } from '../testing/create-contact.dto.fixture';
import { MAX_SUBMISSIONS_PER_IP_PER_DAY } from '../utils/contact-submit.util';
import { EvaluateContactSubmissionGuardsService } from './evaluate-contact-submission-guards.service';

describe('EvaluateContactSubmissionGuardsService', () => {
  let service: EvaluateContactSubmissionGuardsService;
  let repo: jest.Mocked<
    Pick<
      IContactRepository,
      'hasActiveDuplicate' | 'countActiveByIpHashAndDate'
    >
  >;

  const serverNow = 1_700_000_010_000;

  beforeEach(() => {
    repo = {
      hasActiveDuplicate: jest.fn().mockResolvedValue(false),
      countActiveByIpHashAndDate: jest.fn().mockResolvedValue(0),
    };
    service = new EvaluateContactSubmissionGuardsService(
      repo as unknown as IContactRepository,
    );
  });

  it('suprime quando honeypot preenchido', async () => {
    const result = await service.execute(
      buildCreateContactDto({ website: 'http://spam.bot' }),
      '1.2.3.4',
      serverNow,
    );
    expect(result.suppressed).toBe(true);
    expect(repo.hasActiveDuplicate).not.toHaveBeenCalled();
  });

  it('suprime quando formulário preenchido rápido demais', async () => {
    const result = await service.execute(
      buildCreateContactDto({ formOpenedAt: serverNow - 1_000 }),
      '1.2.3.4',
      serverNow,
    );
    expect(result.suppressed).toBe(true);
  });

  it('suprime quando formOpenedAt é antigo demais', async () => {
    const result = await service.execute(
      buildCreateContactDto({
        formOpenedAt: serverNow - 25 * 60 * 60 * 1_000,
      }),
      '1.2.3.4',
      serverNow,
    );
    expect(result.suppressed).toBe(true);
    expect(repo.hasActiveDuplicate).not.toHaveBeenCalled();
  });

  it('suprime quando sessionHash já foi usado no dia', async () => {
    repo.hasActiveDuplicate.mockImplementation((field) =>
      Promise.resolve(field === 'sessionHash'),
    );

    const result = await service.execute(
      buildCreateContactDto({ formOpenedAt: serverNow - 10_000 }),
      '1.2.3.4',
      serverNow,
    );

    expect(result.suppressed).toBe(true);
    expect(repo.hasActiveDuplicate).toHaveBeenCalledWith(
      'sessionHash',
      expect.any(String),
      expect.any(String),
    );
  });

  it('suprime quando e-mail já foi usado no dia', async () => {
    repo.hasActiveDuplicate.mockImplementation((field) =>
      Promise.resolve(field === 'email'),
    );

    const result = await service.execute(
      buildCreateContactDto({ formOpenedAt: serverNow - 10_000 }),
      '1.2.3.4',
      serverNow,
    );

    expect(result.suppressed).toBe(true);
    expect(repo.hasActiveDuplicate).toHaveBeenCalledWith(
      'email',
      'user@example.com',
      expect.any(String),
    );
  });

  it('suprime quando rate limit por IP foi atingido', async () => {
    repo.countActiveByIpHashAndDate.mockResolvedValue(
      MAX_SUBMISSIONS_PER_IP_PER_DAY,
    );

    const result = await service.execute(
      buildCreateContactDto({ formOpenedAt: serverNow - 10_000 }),
      '1.2.3.4',
      serverNow,
    );

    expect(result.suppressed).toBe(true);
    expect(repo.countActiveByIpHashAndDate).toHaveBeenCalled();
  });

  it('passa quando guards ok', async () => {
    const result = await service.execute(
      buildCreateContactDto({ formOpenedAt: serverNow - 10_000 }),
      '1.2.3.4',
      serverNow,
    );
    expect(result.suppressed).toBe(false);
    expect(result.normalizedEmail).toBe('user@example.com');
  });
});
