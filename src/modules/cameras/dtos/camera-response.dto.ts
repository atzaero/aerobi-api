import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Resposta do CRUD **interno** de câmeras. Diferente do DTO **público** do
 * `streams`, este expõe `mediamtxNode`/`mediamtxPath` (moderação autenticada) —
 * a rota pública nunca deve vazar a topologia da tailnet.
 */
export class CameraResponseDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  aerodromeId!: string;

  @ApiProperty({ description: 'ICAO desnormalizado do aeródromo dono' })
  icao!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  mediamtxNode!: string;

  @ApiProperty()
  mediamtxPath!: string;

  @ApiProperty()
  enabled!: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  createdBy!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  updatedBy!: string | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  deletedAt!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  deletedBy!: string | null;
}
