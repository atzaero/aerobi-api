import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * Corpo do `PATCH /movements/:movementId`. Único campo editável de um movimento:
 * a matrícula (`registration`). Aceita o formato de forma tolerante (com/sem
 * hífen ou espaços) e é normalizada para a forma canônica (sem separadores,
 * maiúsculas) no service antes de persistir — igual à criação.
 */
export class UpdateMovementDTO {
  @ApiProperty({
    example: 'PR-ZTT',
    description:
      'Matrícula corrigida. Aceita com/sem hífen ou espaços (ex.: "PR-ZTT", "PRZTT", "PR ZTT"); é normalizada (sem separadores, maiúsculas) antes de persistida e retornada.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  registration!: string;
}
