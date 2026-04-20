import { ApiProperty } from '@nestjs/swagger';

import { BasePaginatedResponseDTO } from '@/common/dtos/base-paginated-response.dto';

import { AerodromeGroupResponseDTO } from './aerodrome-group-response.dto';

export class AerodromeGroupsPaginatedResponseDTO extends BasePaginatedResponseDTO<AerodromeGroupResponseDTO> {
  @ApiProperty({ type: [AerodromeGroupResponseDTO] })
  declare data: AerodromeGroupResponseDTO[];
}
