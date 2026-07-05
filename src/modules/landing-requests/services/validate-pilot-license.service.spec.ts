import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { AnacHttpService } from '@/modules/anac/services/anac-http.service';
import type { AnacScraperService } from '@/modules/anac/services/anac-scraper.service';

import { ValidatePilotLicenseService } from './validate-pilot-license.service';

describe('ValidatePilotLicenseService', () => {
  let service: ValidatePilotLicenseService;
  let fetchLicenseData: jest.Mock;
  let scrapeLicenseData: jest.Mock;

  beforeEach(() => {
    fetchLicenseData = jest.fn().mockResolvedValue('<html/>');
    scrapeLicenseData = jest.fn();
    service = new ValidatePilotLicenseService(
      { fetchLicenseData } as unknown as AnacHttpService,
      { scrapeLicenseData } as unknown as AnacScraperService,
      new ErrorMessageService(),
    );
  });

  it('licença válida: formata o CPF e não lança', async () => {
    scrapeLicenseData.mockResolvedValue({ valido: true });
    await expect(
      service.execute('12345678909', '204603'),
    ).resolves.toBeUndefined();
    expect(fetchLicenseData).toHaveBeenCalledWith('123.456.789-09', '204603');
  });

  it('licença inválida → VALIDATION_FAILED', async () => {
    scrapeLicenseData.mockResolvedValue({ valido: false });
    await expect(
      service.execute('12345678909', '204603'),
    ).rejects.toBeInstanceOf(CustomHttpException);
  });

  it('ANAC fora do ar → EXTERNAL_SERVICE_FAILED', async () => {
    fetchLicenseData.mockRejectedValue(new Error('timeout'));
    await expect(
      service.execute('12345678909', '204603'),
    ).rejects.toBeInstanceOf(CustomHttpException);
  });
});
