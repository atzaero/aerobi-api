import { ApiProperty } from '@nestjs/swagger';

import { BasePaginatedResponseDTO } from '@/common/dtos/base-paginated-response.dto';

import { LandingRequestResponseDTO } from './landing-request-response.dto';

export class LandingRequestsPaginatedResponseDTO extends BasePaginatedResponseDTO<LandingRequestResponseDTO> {
  @ApiProperty({ type: [LandingRequestResponseDTO] })
  declare data: LandingRequestResponseDTO[];
}
