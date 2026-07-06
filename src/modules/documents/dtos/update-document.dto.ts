import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

import { trimString } from '../utils/trim-transform';

/** Único campo editável do documento: o nome original (trim, 1–255). */
export class UpdateDocumentDTO {
  @ApiProperty({ minLength: 1, maxLength: 255 })
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  originalFilename!: string;
}
