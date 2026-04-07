import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';

import { InfotempQueryDto } from '../dtos/infotemp-query.dto';
import { InfotempResponseDto } from '../dtos/infotemp-response.dto';
import {
  ParsedInfotempXml,
  normalizeInfotempItems,
} from '../utils/infotemp-xml-normalize.util';
import { AiswebHttpService } from './aisweb-http.service';

@Injectable()
export class AiswebInfotempService {
  private readonly logger = new Logger(AiswebInfotempService.name);

  constructor(private readonly aiswebHttp: AiswebHttpService) {}

  async execute(query: InfotempQueryDto): Promise<InfotempResponseDto> {
    const apiKey = this.aiswebHttp.getApiKey();
    const apiPass = this.aiswebHttp.getApiPass();

    const qs = this.aiswebHttp.buildQueryString({
      apiKey,
      apiPass,
      area: 'infotemp',
      icaoCode: query.icaoCode,
      number: query.number,
      status: query.status,
      dist: query.dist,
    });

    const text = await this.aiswebHttp.fetchWithFallback(qs);

    let parsed: unknown;
    try {
      parsed = this.aiswebHttp.parseXml(text);
    } catch (err) {
      this.logger.error(`Falha ao parsear XML infotemp: ${String(err)}`);
      throw new UnprocessableEntityException(
        'Resposta inválida da API AISWEB (infotemp)',
      );
    }

    const { total, rawItems } = normalizeInfotempItems(
      parsed as ParsedInfotempXml,
    );

    return { total, items: rawItems as InfotempResponseDto['items'] };
  }
}
