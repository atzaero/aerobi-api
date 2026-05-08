import { ApiProperty } from '@nestjs/swagger';

import { BasePaginatedResponseDTO } from '@/common/dtos/base-paginated-response.dto';

import { TechnicalVisitResponseDTO } from './technical-visit-response.dto';

export class TechnicalVisitsPaginatedResponseDTO extends BasePaginatedResponseDTO<TechnicalVisitResponseDTO> {
  @ApiProperty({ type: [TechnicalVisitResponseDTO] })
  declare data: TechnicalVisitResponseDTO[];
}
