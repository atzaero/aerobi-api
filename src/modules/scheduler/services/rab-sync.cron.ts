import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';

import { RabSyncService } from '@/modules/rab/services/rab-sync.service';

const DEFAULT_RAB_CRON = '0 5 * * *';

@Injectable()
export class RabSyncCron {
  private readonly logger = new Logger(RabSyncCron.name);

  constructor(
    private readonly rabSync: RabSyncService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Cron configurável via RAB_SYNC_CRON (ex.: `0 5 * * *`). Default: todo dia 05:00 UTC.
   */
  @Cron(process.env.RAB_SYNC_CRON ?? DEFAULT_RAB_CRON)
  async handleCron() {
    if (this.config.get<string>('RAB_SYNC_CRON_DISABLED') === 'true') {
      return;
    }
    this.logger.log('Cron RAB: iniciando sync do período mais recente');
    try {
      const r = await this.rabSync.execute({});
      this.logger.log(
        `Cron RAB concluído: period=${r.period} skipped=${r.skipped} rows=${r.rowCount ?? 'n/a'}`,
      );
    } catch (e) {
      this.logger.error('Cron RAB falhou', e);
    }
  }
}
