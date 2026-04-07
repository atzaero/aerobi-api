import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InfotempItemDto {
  @ApiPropertyOptional() number?: string;
  @ApiPropertyOptional() rmk?: string;
  @ApiPropertyOptional() action?: string;
  @ApiPropertyOptional() startdate?: string;
  @ApiPropertyOptional() enddate?: string;
  @ApiPropertyOptional() dt?: string;
}

export class InfotempResponseDto {
  @ApiProperty({ description: 'Total de itens retornados' })
  total: number;

  @ApiProperty({ type: [InfotempItemDto] })
  items: InfotempItemDto[];
}
