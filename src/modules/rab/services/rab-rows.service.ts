import { Injectable } from '@nestjs/common';

import { RabRowRepository } from '../repositories/rab-row.repository';

@Injectable()
export class RabRowsService {
  constructor(private readonly rowRepo: RabRowRepository) {}

  async execute(period: string, skip: number, take: number) {
    const t = Math.min(Math.max(take, 1), 200);
    const [items, total] = await Promise.all([
      this.rowRepo.findManyByPeriod(period, skip, t),
      this.rowRepo.countByPeriod(period),
    ]);
    return { period, skip, take: t, total, items };
  }
}
