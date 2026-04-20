import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Body para PATCH /aerodrome-feedbacks/:id.
 *
 * TODO: adicionar campos editáveis conforme schema.prisma do model AerodromeFeedback.
 */
export class UpdateAerodromeFeedbackDTO {
  @ApiPropertyOptional({ description: 'TODO: descrever campo' })
  placeholder?: string;
}
