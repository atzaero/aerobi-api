import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { GUESS_STATUSES } from '../mappers/maintenance-guess.prisma.mapper';

/**
 * Query para `GET /tasks/:taskId/guesses`.
 */
export class ListTaskGuessesQueryDTO {
  @ApiPropertyOptional({ enum: GUESS_STATUSES })
  @IsOptional()
  @IsEnum(GUESS_STATUSES)
  status?: (typeof GUESS_STATUSES)[number];

  @ApiPropertyOptional({
    description: 'Substring no e-mail (case-insensitive).',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Substring no texto (case-insensitive).',
  })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({
    description: 'Início do período inclusivo (`yyyy-MM-dd`).',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fim do período inclusivo (`yyyy-MM-dd`).',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsString()
  endDate?: string;
}
