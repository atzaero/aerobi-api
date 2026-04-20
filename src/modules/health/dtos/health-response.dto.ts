import { ApiProperty } from '@nestjs/swagger';

export class HealthMemoryDto {
  @ApiProperty({ example: '45.23 MB', description: 'Heap memory used' })
  heapUsed!: string;

  @ApiProperty({
    example: '78.50 MB',
    description: 'Total heap memory allocated',
  })
  heapTotal!: string;

  @ApiProperty({ example: '92.10 MB', description: 'Resident set size' })
  rss!: string;
}

export class HealthDatabaseDto {
  @ApiProperty({
    example: 'ok',
    description: 'Database connection status',
    enum: ['ok', 'error'],
  })
  status!: string;

  @ApiProperty({ example: 'postgresql', description: 'Database type' })
  type!: string;

  @ApiProperty({
    example: 'connection refused',
    description: 'Error message when the database check fails',
    required: false,
  })
  error?: string;
}

export class HealthResponseDto {
  @ApiProperty({
    example: 'ok',
    description: 'API health status',
    enum: ['ok', 'error'],
  })
  status!: string;

  @ApiProperty({
    example: '2026-04-20T17:30:00.000Z',
    description: 'Current server timestamp (ISO 8601)',
  })
  timestamp!: string;

  @ApiProperty({ example: '2h 15m 30s', description: 'Application uptime' })
  uptime!: string;

  @ApiProperty({ example: 'production', description: 'Current environment' })
  environment!: string;

  @ApiProperty({ example: '2.3.2', description: 'API version' })
  version!: string;

  @ApiProperty({
    type: HealthMemoryDto,
    description: 'Memory usage information',
  })
  memory!: HealthMemoryDto;

  @ApiProperty({
    type: HealthDatabaseDto,
    description: 'Database connection info',
  })
  database!: HealthDatabaseDto;
}
