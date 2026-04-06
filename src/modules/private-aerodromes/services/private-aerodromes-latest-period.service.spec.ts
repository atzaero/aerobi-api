import { PrivateAerodromesSyncStateRepository } from '../repositories/private-aerodromes-sync-state.repository';

import { PrivateAerodromesLatestPeriodService } from './private-aerodromes-latest-period.service';

describe('PrivateAerodromesLatestPeriodService', () => {
  let service: PrivateAerodromesLatestPeriodService;
  let findLatestSuccessful: jest.Mock;

  beforeEach(() => {
    findLatestSuccessful = jest.fn();
    const repo = {
      findLatestSuccessful,
    } as unknown as PrivateAerodromesSyncStateRepository;
    service = new PrivateAerodromesLatestPeriodService(repo);
  });

  describe('success', () => {
    it('retorna datasetVersion quando sync bem-sucedido existe', async () => {
      findLatestSuccessful.mockResolvedValue({ datasetVersion: '2024-01-15' });

      const result = await service.execute();

      expect(result).toEqual({ datasetVersion: '2024-01-15' });
      expect(findLatestSuccessful).toHaveBeenCalledTimes(1);
    });

    it('retorna datasetVersion null quando repositório retorna null', async () => {
      findLatestSuccessful.mockResolvedValue(null);

      const result = await service.execute();

      expect(result).toEqual({ datasetVersion: null });
    });

    it('retorna datasetVersion null quando estado existe mas datasetVersion é null', async () => {
      findLatestSuccessful.mockResolvedValue({ datasetVersion: null });

      const result = await service.execute();

      expect(result).toEqual({ datasetVersion: null });
    });
  });

  describe('erros', () => {
    it('propaga erro do repositório', async () => {
      findLatestSuccessful.mockRejectedValue(new Error('db error'));

      await expect(service.execute()).rejects.toThrow('db error');
    });
  });
});
