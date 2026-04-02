import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';

import { PrivateAerodromesSyncService } from '@/modules/private-aerodromes/services/private-aerodromes-sync.service';

const DEFAULT_PRIVATE_AERODROMES_CRON = '10 5 * * *';

@Injectable()
export class PrivateAerodromesSyncCron {
  private readonly logger = new Logger(PrivateAerodromesSyncCron.name);

  constructor(
    private readonly sync: PrivateAerodromesSyncService,
    private readonly config: ConfigService,
  ) {}

  @Cron(
    process.env.PRIVATE_AERODROMES_SYNC_CRON ?? DEFAULT_PRIVATE_AERODROMES_CRON,
  )
  async handleCron() {
    if (
      this.config.get<string>('PRIVATE_AERODROMES_SYNC_CRON_DISABLED') ===
      'true'
    ) {
      return;
    }
    this.logger.log('Cron Private Aerodromes: iniciando sync');
    try {
      const r = await this.sync.execute({});
      this.logger.log(
        `Cron Private Aerodromes concluído: skipped=${r.skipped} rows=${r.rowCount ?? 'n/a'}`,
      );
    } catch (e) {
      this.logger.error('Cron Private Aerodromes falhou', e);
    }
  }
}
