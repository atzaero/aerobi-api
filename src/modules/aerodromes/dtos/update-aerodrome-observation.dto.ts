import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

import { TrimOptionalString } from '@/common/transform';

import { AERODROME_OBSERVATION_MAX_LENGTH } from './create-aerodrome.dto';

/**
 * Atualização apenas da observação pública. Vazio/ausente → limpa o campo
 * (`null`), espelhando o transform do web (`value && length > 0 ? value : null`);
 * a normalização de vazio→null fica no service.
 */
export class UpdateAerodromeObservationDTO {
  @ApiPropertyOptional({
    maxLength: AERODROME_OBSERVATION_MAX_LENGTH,
    nullable: true,
    description: 'Observação pública; vazio ou ausente limpa o campo',
  })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MaxLength(AERODROME_OBSERVATION_MAX_LENGTH, {
    message: 'Observação deve ter até 2000 caracteres',
  })
  observation?: string;
}
