import { ApiProperty } from '@nestjs/swagger';

import { BasePaginatedResponseDTO } from '@/common/dtos/base-paginated-response.dto';

import { MovementListItemDTO } from './movement-list-item.dto';

export class MovementsPaginatedResponseDTO extends BasePaginatedResponseDTO<MovementListItemDTO> {
  @ApiProperty({ type: [MovementListItemDTO] })
  declare data: MovementListItemDTO[];
}
