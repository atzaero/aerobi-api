import { Injectable } from '@nestjs/common';

import { SolQueryDto } from '../dtos/sol-query.dto';
import { SolResponseDto } from '../dtos/sol-response.dto';
import {
  normalizeSolDays,
  transformSolDays,
} from '../utils/sol-xml-normalize.util';
import { AiswebHttpService } from './aisweb-http.service';

@Injectable()
export class AiswebSolService {
  constructor(private readonly aiswebHttp: AiswebHttpService) {}

  async execute(query: SolQueryDto): Promise<SolResponseDto> {
    const today = new Date().toISOString().slice(0, 10);
    const parsed = (await this.aiswebHttp.executeXmlQuery('sol', {
      icaoCode: query.icaoCode,
      dt_i: query.dt_i ?? today,
      dt_f: query.dt_f ?? today,
    })) as { aisweb?: { day?: unknown } };

    const rawDays = normalizeSolDays(parsed);
    return { days: transformSolDays(rawDays) };
  }
}
