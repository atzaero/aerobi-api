import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

/** Parâmetro de rota `:movementId` (UUID) das rotas canônicas `/movements`. */
export class MovementIdParamDTO {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  movementId!: string;
}
