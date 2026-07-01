import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

import { CreateAerodromeDTO } from './create-aerodrome.dto';

/**
 * Edição parcial (semântica PATCH): todos os campos do create tornam-se
 * opcionais (`PartialType` aplica `@IsOptional`), então só o que é enviado é
 * validado e atualizado — omitir um campo **não** o altera (o service/builder
 * traduz ausência em no-op no Prisma). A pista condicional só é exigida quando
 * seus campos (ou `construction`) são de fato enviados. `isView` (publicação) é
 * editável aqui e no `PATCH /:id/status`. O `groupId` só pode mudar por ADMIN.
 */
export class UpdateAerodromeDTO extends PartialType(CreateAerodromeDTO) {
  @ApiPropertyOptional({
    default: false,
    example: true,
    description:
      'Visível publicamente. Só é alterado quando enviado; para alternar apenas a visibilidade use `PATCH /aerodromes/:id/status`.',
  })
  @IsOptional()
  @IsBoolean()
  isView?: boolean;
}
