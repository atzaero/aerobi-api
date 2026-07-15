import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsUUID } from 'class-validator';

import {
  DOCUMENT_TYPE_API_VALUES,
  type DocumentTypeApi,
} from '../utils/document-type';

/**
 * Campos de texto do `POST /documents` (o arquivo chega por multipart e é
 * validado no controller). `type` em lowercase (contrato do web).
 */
export class CreateDocumentDTO {
  @ApiProperty({ format: 'uuid', description: 'Aeródromo dono do documento.' })
  @IsUUID('4')
  aerodromeId!: string;

  @ApiProperty({
    enum: DOCUMENT_TYPE_API_VALUES,
    description: 'Tipo do documento (lowercase).',
  })
  @IsIn(DOCUMENT_TYPE_API_VALUES)
  type!: DocumentTypeApi;
}
