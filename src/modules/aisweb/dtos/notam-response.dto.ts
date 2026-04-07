import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NotamItemDto {
  @ApiPropertyOptional() id?: string;
  @ApiPropertyOptional() icaoairport_id?: string;
  @ApiPropertyOptional() cod?: string;
  @ApiPropertyOptional() status?: string;
  @ApiPropertyOptional() cat?: string;
  @ApiPropertyOptional() dist?: string;
  @ApiPropertyOptional() tp?: string;
  @ApiPropertyOptional() dt?: string;
  @ApiPropertyOptional() n?: string;
  @ApiPropertyOptional() number?: string;
  @ApiPropertyOptional() ref_id?: string;
  @ApiPropertyOptional() ref?: string;
  @ApiPropertyOptional() ref_n?: string;
  @ApiPropertyOptional() ref_year?: string;
  @ApiPropertyOptional() loc?: string;
  @ApiPropertyOptional() b?: string;
  @ApiPropertyOptional() c?: string;
  @ApiPropertyOptional() d?: string;
  @ApiPropertyOptional() e?: string;
  @ApiPropertyOptional() f?: string;
  @ApiPropertyOptional() g?: string;
  @ApiPropertyOptional() nof?: string;
  @ApiPropertyOptional() s?: string;
  @ApiPropertyOptional() geo?: string;
  @ApiPropertyOptional() geo_url?: string;
  @ApiPropertyOptional() aero?: string;
  @ApiPropertyOptional() cidade?: string;
  @ApiPropertyOptional() uf?: string;
  @ApiPropertyOptional() origem?: string;
  @ApiPropertyOptional() fir?: string;
  @ApiPropertyOptional() year?: string;
  @ApiPropertyOptional() traffic?: string;
  @ApiPropertyOptional() lower?: string;
  @ApiPropertyOptional() upper?: string;
  @ApiPropertyOptional() state?: string;
  @ApiPropertyOptional() purpose?: string;
  @ApiPropertyOptional() scope?: string;
  @ApiPropertyOptional() seqnumber?: string;
  @ApiPropertyOptional() ref_s?: string;
}

export class NotamResponseDto {
  @ApiProperty({ description: 'Total de itens' })
  total: number;

  @ApiPropertyOptional({ description: 'Data/hora de atualização' })
  updatedat?: string;

  @ApiProperty({ type: [NotamItemDto] })
  items: NotamItemDto[];
}
