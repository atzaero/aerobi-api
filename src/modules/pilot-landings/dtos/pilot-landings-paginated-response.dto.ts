import { ApiProperty } from '@nestjs/swagger';

import { BasePaginatedResponseDTO } from '@/common/dtos/base-paginated-response.dto';

import { PilotLandingResponseDTO } from './pilot-landing-response.dto';

export class PilotLandingsPaginatedResponseDTO extends BasePaginatedResponseDTO<PilotLandingResponseDTO> {
  @ApiProperty({ type: [PilotLandingResponseDTO] })
  declare data: PilotLandingResponseDTO[];
}
