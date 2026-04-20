import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import * as iconv from 'iconv-lite';

@Injectable()
export class AnacHttpService {
  private readonly logger = new Logger(AnacHttpService.name);
  private readonly url = 'https://consultadelicencas.anac.gov.br/consultadelicencas/';

  constructor(private readonly http: HttpService) {}

  async fetchLicenseData(cpf: string, canac: string): Promise<string> {
    const formData = new URLSearchParams();
    formData.append('txtCodAnac', '');
    formData.append('IDIOMA', 'P');
    formData.append('txcoddac', canac);
    formData.append('txCPF', cpf);
    formData.append('DtNasc', '');
    formData.append('enviar', 'enviar');

    try {
      const response = await firstValueFrom(
        this.http.post(this.url, formData, {
          responseType: 'arraybuffer',
          headers: {
            accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded',
            pragma: 'no-cache',
            'sec-ch-ua':
              '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Linux"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
            'upgrade-insecure-requests': '1',
            Referer: this.url,
          },
        }),
      );

      const html = iconv.decode(Buffer.from(response.data), 'latin1');
      return html;
    } catch (error) {
      this.logger.error(`Erro ao consultar ANAC: ${error}`);
      throw error;
    }
  }
}
