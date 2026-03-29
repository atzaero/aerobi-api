import { Injectable } from '@nestjs/common';

import { RabSyncStateMapper } from '../mappers/rab-sync-state.mapper';
import { RabSyncStateRepository } from '../repositories/rab-sync-state.repository';

@Injectable()
export class RabSyncStateService {
  constructor(private readonly repo: RabSyncStateRepository) {}

  execute() {
    return this.repo
      .findManyOrderByPeriodDesc()
      .then((rows) => RabSyncStateMapper.toApiRows(rows));
  }
}
