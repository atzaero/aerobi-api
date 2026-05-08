import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OperationalAerodromeResponseDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  groupId!: string;

  @ApiProperty()
  icao!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  ciad!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  designation!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  length!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  width!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  resistance!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  surface!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  altitude!: string | null;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  municipality!: string | null;

  @ApiProperty()
  latitude!: string;

  @ApiProperty()
  longitude!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  latitudeFormatted!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  longitudeFormatted!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  operation!: string | null;

  @ApiPropertyOptional({ nullable: true, type: Boolean })
  lit!: boolean | null;

  @ApiPropertyOptional({ nullable: true, type: Boolean })
  fueling!: boolean | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  observation!: string | null;

  @ApiPropertyOptional({ nullable: true, type: Boolean })
  construction!: boolean | null;

  @ApiProperty()
  isOpen!: boolean;

  @ApiProperty()
  isView!: boolean;

  @ApiPropertyOptional({ nullable: true, type: String })
  weatherStationCode!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  weatherStationDisplay!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  fileType!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  imgUrl!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  kmlUrl!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  registrationOrdinanceUrl!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  planOrdinanceUrl!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  grantTermUrl!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  aeronauticalStudyUrl!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  weatherUrl!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  windUrl!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  videoUrl!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  createdBy!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  updatedBy!: string | null;

  @ApiPropertyOptional({ nullable: true, format: 'date-time', type: String })
  deletedAt!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  deletedBy!: string | null;
}
