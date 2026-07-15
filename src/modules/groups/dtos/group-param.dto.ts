import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

/**
 * Param de rota das operações sobre um grupo individual (`:id`). O nome `id` é
 * o esperado pelo `GroupScopeGuard` (`request.params.id`) ao resolver o escopo.
 */
export class GroupParamDTO {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  id!: string;
}
