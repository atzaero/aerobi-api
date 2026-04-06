import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';

import { PublicAerodromesSyncService } from '@/modules/public-aerodromes/services/public-aerodromes-sync.service';

const DEFAULT_PUBLIC_AERODROMES_CRON = '20 5 * * *';

@Injectable()
export class PublicAerodromesSyncCron {
  private readonly logger = new Logger(PublicAerodromesSyncCron.name);

  constructor(
    private readonly sync: PublicAerodromesSyncService,
    private readonly config: ConfigService,
  ) {}

  @Cron(
    process.env.PUBLIC_AERODROMES_SYNC_CRON ?? DEFAULT_PUBLIC_AERODROMES_CRON,
  )
  async handleCron() {
    if (
      this.config.get<string>('PUBLIC_AERODROMES_SYNC_CRON_DISABLED') === 'true'
    ) {
      return;
    }
    this.logger.log('Cron Public Aerodromes: iniciando sync');
    try {
      const r = await this.sync.execute({});
      this.logger.log(
        `Cron Public Aerodromes concluído: skipped=${r.skipped} rows=${r.rowCount ?? 'n/a'}`,
      );
    } catch (e) {
      this.logger.error('Cron Public Aerodromes falhou', e);
    }
  }
}
