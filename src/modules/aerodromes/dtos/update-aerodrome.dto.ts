import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

import { CreateAerodromeDTO } from './create-aerodrome.dto';

/**
 * Edição completa (full edit) de um aeródromo — espelha o update do `aerobi-web`,
 * que reenvia todos os campos do create. Herda todas as validações (inclusive a
 * pista condicional) e acrescenta `isView` (publicação), editável só aqui e no
 * set-status. O `groupId` só pode mudar por ADMIN — o service bloqueia a troca de
 * grupo por COORDINATOR.
 */
export class UpdateAerodromeDTO extends CreateAerodromeDTO {
  @ApiPropertyOptional({
    default: false,
    example: true,
    description:
      'Visível publicamente. Atenção: por ser edição completa, **omitir este campo o define como `false`** (despublica). Reenvie o valor atual para preservar a publicação. Para alternar só a visibilidade sem reenviar tudo, use `PATCH /aerodromes/:id/status`.',
  })
  @IsOptional()
  @IsBoolean()
  isView?: boolean;
}
