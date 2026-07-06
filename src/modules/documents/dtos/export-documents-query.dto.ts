import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

import {
  DOCUMENT_TYPE_API_VALUES,
  type DocumentTypeApi,
} from '../utils/document-type';
import { trimString } from '../utils/trim-transform';

/** Filtros do export (mesma semântica da list, sem paginação). */
export class ExportDocumentsQueryDTO {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  aerodromeId?: string;

  @ApiPropertyOptional({ enum: DOCUMENT_TYPE_API_VALUES })
  @IsOptional()
  @IsIn(DOCUMENT_TYPE_API_VALUES)
  type?: DocumentTypeApi;

  @ApiPropertyOptional({ description: 'Substring no nome do arquivo.' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(255)
  search?: string;
}
