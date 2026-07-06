import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsUUID } from 'class-validator';

/** Modos do upload dedicado — só escolhem a permissão (`aerodrome:create|update`). */
export const UPLOAD_AERODROME_FILE_MODES = ['create', 'update'] as const;
export type UploadAerodromeFileMode =
  (typeof UPLOAD_AERODROME_FILE_MODES)[number];

/** Tipos aceitos pelo upload dedicado (subconjunto de DocumentType). */
export const UPLOAD_AERODROME_FILE_TYPES = ['kml', 'image'] as const;
export type UploadAerodromeFileType =
  (typeof UPLOAD_AERODROME_FILE_TYPES)[number];

/**
 * Campos de texto do `POST /documents/aerodrome-file` (o arquivo chega por
 * multipart). `type ∈ {kml,image}`, `mode ∈ {create,update}`.
 */
export class UploadAerodromeFileDTO {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  aerodromeId!: string;

  @ApiProperty({ enum: UPLOAD_AERODROME_FILE_TYPES })
  @IsIn(UPLOAD_AERODROME_FILE_TYPES)
  type!: UploadAerodromeFileType;

  @ApiProperty({ enum: UPLOAD_AERODROME_FILE_MODES })
  @IsIn(UPLOAD_AERODROME_FILE_MODES)
  mode!: UploadAerodromeFileMode;
}
