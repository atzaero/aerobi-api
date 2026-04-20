import { ApiProperty } from '@nestjs/swagger';

import { BasePaginatedResponseDTO } from '@/common/dtos/base-paginated-response.dto';

import { AerodromeGeojsonResponseDTO } from './aerodrome-geojson-response.dto';

export class AerodromeGeojsonsPaginatedResponseDTO extends BasePaginatedResponseDTO<AerodromeGeojsonResponseDTO> {
  @ApiProperty({ type: [AerodromeGeojsonResponseDTO] })
  declare data: AerodromeGeojsonResponseDTO[];
}
