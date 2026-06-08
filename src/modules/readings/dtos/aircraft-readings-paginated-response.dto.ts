import { ApiProperty } from '@nestjs/swagger';

import { BasePaginatedResponseDTO } from '@/common/dtos/base-paginated-response.dto';

import { AircraftReadingResponseDTO } from './aircraft-reading-response.dto';

export class AircraftReadingsPaginatedResponseDTO extends BasePaginatedResponseDTO<AircraftReadingResponseDTO> {
  @ApiProperty({ type: [AircraftReadingResponseDTO] })
  declare data: AircraftReadingResponseDTO[];
}
