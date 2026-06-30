import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

/** Body para POST /pilot-landings */
export class CreatePilotLandingDTO {
  @ApiPropertyOptional({
    description: 'Aeródromo associado (opcional)',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4')
  aerodromeId?: string;

  @ApiProperty({ description: 'Matrícula da aeronave', example: 'PT-ABC' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  registration!: string;

  @ApiProperty({ description: 'Nome local do pouso', example: 'Campo XYZ' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  localName!: string;

  @ApiProperty({ description: 'ICAO/local', example: 'SDXX' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  localIcao!: string;

  @ApiProperty({ description: 'Indica verificação do registo', example: true })
  @IsBoolean()
  checked!: boolean;

  @ApiProperty({
    description: 'Path/caminho das imagens associadas ao pouso',
    example: 'landings/pt-abc/2024-01-01',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  imagesPath!: string;

  @ApiProperty({
    description: 'Instante do pouso em UTC',
    example: '2024-06-01T14:30:00.000Z',
  })
  @Type(() => Date)
  @IsDate()
  landingAt!: Date;

  @ApiPropertyOptional({
    description: 'Audit: quem criou (opcional até existir utilizadores na API)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  createdBy?: string;
}
