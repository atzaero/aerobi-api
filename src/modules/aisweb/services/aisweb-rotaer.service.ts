import { Injectable } from '@nestjs/common';

import { RotaerQueryDto } from '../dtos/rotaer-query.dto';
import { buildRotaerDto } from '../utils/rotaer-xml-build.util';
import { AiswebHttpService } from './aisweb-http.service';

@Injectable()
export class AiswebRotaerService {
  constructor(private readonly aiswebHttp: AiswebHttpService) {}

  async execute(query: RotaerQueryDto): Promise<Record<string, unknown>> {
    const parsed = (await this.aiswebHttp.executeXmlQuery('rotaer', {
      icaoCode: query.icaoCode,
    })) as { aisweb?: Record<string, unknown> };

    return buildRotaerDto(parsed);
  }
}
