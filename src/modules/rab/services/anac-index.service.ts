import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

const CSV_LINK_RE = /href="(\d{4}-\d{2}\.csv)"/gi;

@Injectable()
export class AnacIndexService {
  private readonly logger = new Logger(AnacIndexService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  getIndexUrl(): string {
    return (
      this.config.get<string>('ANAC_RAB_INDEX_URL') ??
      'https://sistemas.anac.gov.br/dadosabertos/Aeronaves/RAB/Historico_RAB/'
    );
  }

  csvUrlForPeriod(period: string): string {
    const base = this.getIndexUrl().replace(/\/?$/, '/');
    return `${base}${period}.csv`;
  }

  /**
   * Extrai períodos YYYY-MM do índice HTML e retorna o maior (mês mais recente).
   */
  async execute(): Promise<string> {
    const url = this.getIndexUrl();
    const { data } = await firstValueFrom(
      this.http.get<string>(url, { responseType: 'text' }),
    );
    const periods = new Set<string>();
    let m: RegExpExecArray | null;
    const re = new RegExp(CSV_LINK_RE);
    while ((m = re.exec(data)) !== null) {
      periods.add(m[1].replace('.csv', ''));
    }
    if (periods.size === 0) {
      throw new Error(`Nenhum CSV YYYY-MM encontrado no índice: ${url}`);
    }
    const latest = [...periods].sort().at(-1)!;
    this.logger.log(`Último período no índice ANAC: ${latest}`);
    return latest;
  }
}
