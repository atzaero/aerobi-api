import { ApiProperty } from '@nestjs/swagger';

import { BasePaginatedResponseDTO } from '@/common/dtos/base-paginated-response.dto';

import { PublicAerodromeResponseDTO } from './public-aerodrome-response.dto';

export class PublicAerodromesPaginatedResponseDTO extends BasePaginatedResponseDTO<PublicAerodromeResponseDTO> {
  @ApiProperty({ type: [PublicAerodromeResponseDTO] })
  declare data: PublicAerodromeResponseDTO[];
}
