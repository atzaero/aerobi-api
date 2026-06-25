import { ApiProperty } from '@nestjs/swagger';

import { AerodromeGroupResponseDTO } from './aerodrome-group-response.dto';

/**
 * Resposta do soft-delete de grupo. Carrega o grupo removido + a contagem de
 * aeródromos operacionais fechados (`isOpen=false`, `isView=false`) na mesma
 * transação — espelha o `affectedAerodromes` da cascata do `aerobi-web`.
 */
export class AerodromeGroupDeletionResponseDTO extends AerodromeGroupResponseDTO {
  @ApiProperty({
    description:
      'Quantidade de aeródromos operacionais do grupo fechados na cascata.',
    example: 3,
  })
  affectedAerodromes!: number;
}
