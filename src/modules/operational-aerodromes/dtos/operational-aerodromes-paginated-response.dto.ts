import { ApiProperty } from '@nestjs/swagger';

import { BasePaginatedResponseDTO } from '@/common/dtos/base-paginated-response.dto';

import { OperationalAerodromeResponseDTO } from './operational-aerodrome-response.dto';

export class OperationalAerodromesPaginatedResponseDTO extends BasePaginatedResponseDTO<OperationalAerodromeResponseDTO> {
  @ApiProperty({ type: [OperationalAerodromeResponseDTO] })
  declare data: OperationalAerodromeResponseDTO[];
}
