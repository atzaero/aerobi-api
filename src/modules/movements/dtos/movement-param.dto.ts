import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

/** Parâmetro de rota `:readingId` (UUID) para find/remove. */
export class MovementParamDTO {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  readingId!: string;
}
