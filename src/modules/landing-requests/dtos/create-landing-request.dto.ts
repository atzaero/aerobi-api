import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { LandingRequestStatus } from '@/generated/prisma/client';

export class CreateLandingRequestDTO {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  operationalAerodromeId!: string;

  @ApiProperty({ enum: LandingRequestStatus })
  @IsEnum(LandingRequestStatus)
  status!: LandingRequestStatus;

  @ApiProperty({ example: '2024-06-01T10:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  requestDate!: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @MaxLength(320)
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  pilotCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  aircraftModel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  aircraftRegistration?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(32)
  departureAerodrome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  observation?: string;

  @ApiPropertyOptional({
    description: 'Data/hora da revisão pelo coordenador',
    example: '2024-06-02T12:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  reviewedAt?: Date;

  @ApiPropertyOptional({ description: 'Identificador de quem revisou' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reviewedBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  createdBy?: string;
}
