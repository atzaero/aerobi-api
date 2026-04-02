import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

const UPDATED_AT_RE = /Atualizado em:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i;

@Injectable()
export class AnacPrivateAerodromesSourceService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  getCsvUrl(): string {
    return (
      this.config.get<string>('ANAC_PRIVATE_AERODROMES_CSV_URL') ??
      'https://sistemas.anac.gov.br/dadosabertos/Aerodromos/Aer%C3%B3dromos%20Privados/Lista%20de%20aer%C3%B3dromos%20privados/Aerodromos%20Privados/AerodromosPrivados.csv'
    );
  }

  extractDatasetVersionFromCsv(buffer: Buffer): string {
    const asLatin1 = new TextDecoder('windows-1252').decode(buffer);
    const m = UPDATED_AT_RE.exec(asLatin1);
    return m?.[1] ?? 'unknown';
  }

  async head() {
    return firstValueFrom(this.http.head(this.getCsvUrl()));
  }

  async download() {
    return firstValueFrom(
      this.http.get<ArrayBuffer>(this.getCsvUrl(), {
        responseType: 'arraybuffer',
      }),
    );
  }
}
