import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

/**
 * Param de rota das operações sobre um feedback individual (`:id`). O nome `id`
 * é o esperado pelo `GroupScopeGuard` (`request.params.id`) ao resolver o escopo
 * por grupo do recurso (via `aerodrome.groupId`).
 */
export class AerodromeFeedbackParamDTO {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  id!: string;
}
