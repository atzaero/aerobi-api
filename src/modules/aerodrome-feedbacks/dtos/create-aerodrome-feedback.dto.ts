import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Body para POST /aerodrome-feedbacks.
 *
 * TODO: adicionar campos conforme schema.prisma do model AerodromeFeedback.
 */
export class CreateAerodromeFeedbackDTO {
  @ApiPropertyOptional({ description: 'TODO: descrever campo' })
  placeholder?: string;
}
