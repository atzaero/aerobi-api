import { Injectable } from '@nestjs/common';

import { PublicAerodromesSyncStateRepository } from '../repositories/public-aerodromes-sync-state.repository';

@Injectable()
export class PublicAerodromesLatestPeriodService {
  constructor(
    private readonly syncStateRepo: PublicAerodromesSyncStateRepository,
  ) {}

  async execute(): Promise<{ datasetVersion: string | null }> {
    const state = await this.syncStateRepo.findLatestSuccessful();
    return { datasetVersion: state?.datasetVersion ?? null };
  }
}
