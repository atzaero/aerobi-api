import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';

/** Body para PATCH /pilot-landings/:id — campos opcionais */
export class UpdatePilotLandingDTO {
  @ApiPropertyOptional({
    description: 'Se `true`, remove a associação ao aeródromo operacional',
  })
  @IsOptional()
  @IsBoolean()
  disconnectOperationalAerodrome?: boolean;

  @ApiPropertyOptional({ format: 'uuid' })
  @ValidateIf(
    (_o: UpdatePilotLandingDTO, v) =>
      typeof v === 'string' && !_o.disconnectOperationalAerodrome,
  )
  @IsUUID('4')
  operationalAerodromeId?: string;

  @ApiPropertyOptional({ example: 'PT-ABC' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  registration?: string;

  @ApiPropertyOptional({ example: 'Campo XYZ' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  localName?: string;

  @ApiPropertyOptional({ example: 'SDXX' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  localIcao?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  checked?: boolean;

  @ApiPropertyOptional({
    description: 'Path/caminho das imagens',
    example: 'landings/pt-abc',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  imagesPath?: string;

  @ApiPropertyOptional({
    description: 'Instante do pouso em UTC',
    example: '2024-06-01T14:30:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  landingAt?: Date;
}
