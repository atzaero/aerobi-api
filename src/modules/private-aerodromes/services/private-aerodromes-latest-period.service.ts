import { Injectable } from '@nestjs/common';

import { PrivateAerodromesSyncStateRepository } from '../repositories/private-aerodromes-sync-state.repository';

@Injectable()
export class PrivateAerodromesLatestPeriodService {
  constructor(
    private readonly syncStateRepo: PrivateAerodromesSyncStateRepository,
  ) {}

  async execute(): Promise<{ datasetVersion: string | null }> {
    const state = await this.syncStateRepo.findLatestSuccessful();
    return { datasetVersion: state?.datasetVersion ?? null };
  }
}
