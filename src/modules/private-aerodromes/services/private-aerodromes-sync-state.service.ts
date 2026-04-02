import { Injectable } from '@nestjs/common';

import { PrivateAerodromesSyncStateMapper } from '../mappers/private-aerodromes-sync-state.mapper';
import { PrivateAerodromesSyncStateRepository } from '../repositories/private-aerodromes-sync-state.repository';

@Injectable()
export class PrivateAerodromesSyncStateService {
  constructor(private readonly repo: PrivateAerodromesSyncStateRepository) {}

  async execute() {
    const rows = await this.repo.findManyOrderBySyncedAtDesc();
    return PrivateAerodromesSyncStateMapper.toApiRows(rows);
  }
}
