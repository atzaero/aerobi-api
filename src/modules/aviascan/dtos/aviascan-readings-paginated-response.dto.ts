import { ApiProperty } from '@nestjs/swagger';

import { BasePaginatedResponseDTO } from '@/common/dtos/base-paginated-response.dto';

import { AviascanReadingDto } from './aviascan-reading.dto';

/**
 * Envelope paginado (`data` + `meta`) das leituras AviaScan.
 * A `meta` é encaminhada tal como vem do upstream (mesmo formato já usado pela Aerobi).
 */
export class AviascanReadingsPaginatedResponseDto extends BasePaginatedResponseDTO<AviascanReadingDto> {
  @ApiProperty({ type: AviascanReadingDto, isArray: true })
  declare data: AviascanReadingDto[];
}
