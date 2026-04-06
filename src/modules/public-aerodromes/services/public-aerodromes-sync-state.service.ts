import { Injectable } from '@nestjs/common';

import { PublicAerodromesSyncStateMapper } from '../mappers/public-aerodromes-sync-state.mapper';
import { PublicAerodromesSyncStateRepository } from '../repositories/public-aerodromes-sync-state.repository';

@Injectable()
export class PublicAerodromesSyncStateService {
  constructor(private readonly repo: PublicAerodromesSyncStateRepository) {}

  async execute() {
    const rows = await this.repo.findManyOrderBySyncedAtDesc();
    return PublicAerodromesSyncStateMapper.toApiRows(rows);
  }
}
