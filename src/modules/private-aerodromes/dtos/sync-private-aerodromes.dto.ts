import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class SyncPrivateAerodromesDto {
  @ApiPropertyOptional({ description: 'Força download e reprocessamento' })
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}
