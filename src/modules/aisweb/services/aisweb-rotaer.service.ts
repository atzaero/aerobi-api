import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';

import { RotaerQueryDto } from '../dtos/rotaer-query.dto';
import { buildRotaerDto } from '../utils/rotaer-xml-build.util';
import { AiswebHttpService } from './aisweb-http.service';

@Injectable()
export class AiswebRotaerService {
  private readonly logger = new Logger(AiswebRotaerService.name);

  constructor(private readonly aiswebHttp: AiswebHttpService) {}

  async execute(query: RotaerQueryDto): Promise<Record<string, unknown>> {
    const apiKey = this.aiswebHttp.getApiKey();
    const apiPass = this.aiswebHttp.getApiPass();

    const qs = this.aiswebHttp.buildQueryString({
      apiKey,
      apiPass,
      area: 'rotaer',
      icaoCode: query.icaoCode,
    });

    const text = await this.aiswebHttp.fetchWithFallback(qs);

    let parsed: { aisweb?: Record<string, unknown> };
    try {
      parsed = this.aiswebHttp.parseXml(text) as {
        aisweb?: Record<string, unknown>;
      };
    } catch (err) {
      this.logger.error(`Falha ao parsear XML rotaer: ${String(err)}`);
      throw new UnprocessableEntityException(
        'Resposta inválida da API AISWEB (rotaer)',
      );
    }

    return buildRotaerDto(parsed);
  }
}
