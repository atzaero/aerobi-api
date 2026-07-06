import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

/**
 * Param de rota das operações sobre um documento individual (`:id`). O nome `id`
 * é o esperado pelo `GroupScopeGuard` (`request.params.id`), que resolve o escopo
 * via `GroupScopeSubject.DOCUMENT` (FK até `aerodrome.groupId`).
 */
export class DocumentParamDTO {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  id!: string;
}
