import { ApiProperty } from '@nestjs/swagger';

import { BasePaginatedResponseDTO } from '@/common/dtos/base-paginated-response.dto';

import { MovementResponseDTO } from './movement-response.dto';

export class MovementsPaginatedResponseDTO extends BasePaginatedResponseDTO<MovementResponseDTO> {
  @ApiProperty({ type: [MovementResponseDTO] })
  declare data: MovementResponseDTO[];
}
