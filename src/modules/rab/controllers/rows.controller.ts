import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RowsDocs } from '../docs/rows.docs';
import { RabRowsService } from '../services/rab-rows.service';

@ApiTags('RAB')
@Controller('rab')
export class RowsController {
  constructor(private readonly rabRows: RabRowsService) {}

  @Get('rows')
  @RowsDocs()
  handle(
    @Query('period') period: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) take: number,
  ) {
    return this.rabRows.execute(period, skip, take);
  }
}
