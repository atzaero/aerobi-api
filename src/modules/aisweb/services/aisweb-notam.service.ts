import { Injectable } from '@nestjs/common';

import { NotamQueryDto } from '../dtos/notam-query.dto';
import { NotamResponseDto } from '../dtos/notam-response.dto';
import {
  ParsedNotamXml,
  normalizeNotamItems,
} from '../utils/notam-xml-normalize.util';
import { AiswebHttpService } from './aisweb-http.service';

@Injectable()
export class AiswebNotamService {
  constructor(private readonly aiswebHttp: AiswebHttpService) {}

  async execute(query: NotamQueryDto): Promise<NotamResponseDto> {
    const parsed = await this.aiswebHttp.executeXmlQuery('notam', {
      dist: query.dist,
      nof: query.nof,
      serie: query.serie,
      categoria: query.categoria,
      status: query.status,
      fir: query.fir,
      nnotam: query.nnotam,
      ano: query.ano,
      dt_ref: query.dt_ref,
      dt: query.dt,
      all: query.all,
      minutes: query.minutes,
      dt_start: query.dt_start,
      dt_end: query.dt_end,
      icaocode: query.icaocode,
      type: query.type,
    });

    const { total, updatedat, rawItems } = normalizeNotamItems(
      parsed as ParsedNotamXml,
    );

    return {
      total,
      updatedat,
      items: rawItems as NotamResponseDto['items'],
    };
  }
}
