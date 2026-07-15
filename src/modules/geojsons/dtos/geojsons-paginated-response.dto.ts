import { ApiProperty } from '@nestjs/swagger';

import { BasePaginatedResponseDTO } from '@/common/dtos/base-paginated-response.dto';

import { GeojsonResponseDTO } from './geojson-response.dto';

export class GeojsonsPaginatedResponseDTO extends BasePaginatedResponseDTO<GeojsonResponseDTO> {
  @ApiProperty({ type: [GeojsonResponseDTO] })
  declare data: GeojsonResponseDTO[];
}
