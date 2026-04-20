import { ApiProperty } from '@nestjs/swagger';

import { BasePaginatedResponseDTO } from '@/common/dtos/base-paginated-response.dto';

import { AerodromeFeedbackResponseDTO } from './aerodrome-feedback-response.dto';

export class AerodromeFeedbacksPaginatedResponseDTO extends BasePaginatedResponseDTO<AerodromeFeedbackResponseDTO> {
  @ApiProperty({ type: [AerodromeFeedbackResponseDTO] })
  declare data: AerodromeFeedbackResponseDTO[];
}
