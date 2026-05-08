import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateTechnicalVisitDTO {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  operationalAerodromeId!: string;

  @ApiPropertyOptional({
    description: 'Uids Auth ou e-mails dos editores (ordem)',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(500)
  @IsString({ each: true })
  modifierUsers?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gatesPadlocksObservation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasGatesPadlocks?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fenceObservation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasFence?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  standardPlateObservation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasStandardPlate?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  qualityObservation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  qualityOthersObservation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasQualityHoles?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasQualityAsphalt?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasQualityOthers?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  horizontalSignageObservation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasHorizontalSignage?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unobstructedHeadboardsObservation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasUnobstructedHeadboards?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  trackRangeObservation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasTrackRange?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  pavementRegularity?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  trashDebrisObservation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasTrashDebris?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  delimitedPerimeterObservation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasDelimitedPerimeter?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasInvasion?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  extraObservation?: string;

  @ApiProperty({ example: '2024-06-01T09:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  visitAt!: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  visitBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  createdBy?: string;
}
