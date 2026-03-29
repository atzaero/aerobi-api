import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

export class SyncRabDto {
  @ApiPropertyOptional({
    description:
      'Período YYYY-MM; omite para usar o mais recente do índice ANAC',
    example: '2026-03',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/)
  period?: string;

  @ApiPropertyOptional({ description: 'Força download e reprocessamento' })
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}
