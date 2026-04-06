import { ApiProperty } from '@nestjs/swagger';

import { BasePaginatedResponseDTO } from '@/common/dtos/base-paginated-response.dto';

import { PrivateAerodromeResponseDTO } from './private-aerodrome-response.dto';

export class PrivateAerodromesPaginatedResponseDTO extends BasePaginatedResponseDTO<PrivateAerodromeResponseDTO> {
  @ApiProperty({ type: [PrivateAerodromeResponseDTO] })
  declare data: PrivateAerodromeResponseDTO[];
}
