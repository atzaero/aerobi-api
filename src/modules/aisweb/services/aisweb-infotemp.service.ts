import { Injectable } from '@nestjs/common';

import { InfotempQueryDto } from '../dtos/infotemp-query.dto';
import { InfotempResponseDto } from '../dtos/infotemp-response.dto';
import {
  ParsedInfotempXml,
  normalizeInfotempItems,
} from '../utils/infotemp-xml-normalize.util';
import { AiswebHttpService } from './aisweb-http.service';

@Injectable()
export class AiswebInfotempService {
  constructor(private readonly aiswebHttp: AiswebHttpService) {}

  async execute(query: InfotempQueryDto): Promise<InfotempResponseDto> {
    const parsed = await this.aiswebHttp.executeXmlQuery('infotemp', {
      icaoCode: query.icaoCode,
      number: query.number,
      status: query.status,
      dist: query.dist,
    });

    const { total, rawItems } = normalizeInfotempItems(
      parsed as ParsedInfotempXml,
    );

    return { total, items: rawItems as InfotempResponseDto['items'] };
  }
}
