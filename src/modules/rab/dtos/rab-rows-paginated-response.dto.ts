import { ApiProperty } from '@nestjs/swagger';

import { BasePaginatedResponseDTO } from '@/common/dtos/base-paginated-response.dto';

import { RabRowResponseDTO } from './rab-row-response.dto';

export class RabRowsPaginatedResponseDTO extends BasePaginatedResponseDTO<RabRowResponseDTO> {
  @ApiProperty({ type: [RabRowResponseDTO] })
  declare data: RabRowResponseDTO[];
}
