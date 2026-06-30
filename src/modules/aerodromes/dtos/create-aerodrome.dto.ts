import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateAerodromeDTO {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  groupId!: string;

  @ApiProperty({ example: 'SDXX' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  icao!: string;

  @ApiPropertyOptional({ maxLength: 64 })
  @IsOptional()
  @IsString()
  ciad?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiPropertyOptional({ maxLength: 64 })
  @IsOptional()
  @IsString()
  length?: string;

  @ApiPropertyOptional({ maxLength: 64 })
  @IsOptional()
  @IsString()
  width?: string;

  @ApiPropertyOptional({ maxLength: 64 })
  @IsOptional()
  @IsString()
  resistance?: string;

  @ApiPropertyOptional({ maxLength: 64 })
  @IsOptional()
  @IsString()
  surface?: string;

  @ApiPropertyOptional({ maxLength: 64 })
  @IsOptional()
  @IsString()
  altitude?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  name!: string;

  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  municipality?: string;

  @ApiProperty({
    description: 'Coordenada texto (mantido igual ao modelo legado)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  latitude!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  longitude!: string;

  @ApiPropertyOptional({ maxLength: 64 })
  @IsOptional()
  @IsString()
  latitudeFormatted?: string;

  @ApiPropertyOptional({ maxLength: 64 })
  @IsOptional()
  @IsString()
  longitudeFormatted?: string;

  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  operation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  lit?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  fueling?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  construction?: boolean;

  @ApiProperty()
  @IsBoolean()
  isOpen!: boolean;

  @ApiProperty()
  @IsBoolean()
  isView!: boolean;

  @ApiPropertyOptional({ maxLength: 64 })
  @IsOptional()
  @IsString()
  weatherStationCode?: string;

  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  weatherStationDisplay?: string;

  @ApiPropertyOptional({ maxLength: 128 })
  @IsOptional()
  @IsString()
  fileType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imgUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  kmlUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  registrationOrdinanceUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  planOrdinanceUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  grantTermUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  aeronauticalStudyUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  weatherUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  windUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  createdBy?: string;
}
