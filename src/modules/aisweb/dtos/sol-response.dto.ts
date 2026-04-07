import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SolDayDto {
  @ApiProperty() date: string;
  @ApiProperty({ description: 'Hora do nascer do sol (UTC)' }) sunrise: string;
  @ApiProperty({ description: 'Hora do pôr do sol (UTC)' }) sunset: string;
  @ApiProperty({ description: 'Dia da semana (1–7)', minimum: 1, maximum: 7 })
  weekDay: number;
  @ApiProperty() aero: string;
  @ApiPropertyOptional() geo?: string;
}

export class SolResponseDto {
  @ApiProperty({ type: [SolDayDto] })
  days: SolDayDto[];
}
