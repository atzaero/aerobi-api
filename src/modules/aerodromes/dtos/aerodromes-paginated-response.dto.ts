import { ApiProperty } from '@nestjs/swagger';

import { BasePaginatedResponseDTO } from '@/common/dtos/base-paginated-response.dto';

import { AerodromeResponseDTO } from './aerodrome-response.dto';

export class AerodromesPaginatedResponseDTO extends BasePaginatedResponseDTO<AerodromeResponseDTO> {
  @ApiProperty({ type: [AerodromeResponseDTO] })
  declare data: AerodromeResponseDTO[];
}
