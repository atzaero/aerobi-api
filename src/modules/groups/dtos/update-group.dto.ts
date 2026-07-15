import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { TrimString } from '@/common/transform';

/**
 * Edição de grupo alinhada ao `aerobi-web`: apenas `name` é mutável. `uf` é o
 * source-of-truth do estado e permanece imutável aqui (as colunas
 * `owner_id`/`deletion_requested` continuam no schema, mas saem do contrato de
 * edição).
 */
export class UpdateGroupDTO {
  @ApiProperty({ description: 'Nome do grupo', example: 'Interior SP' })
  @TrimString()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  name!: string;
}
