import { ApiProperty } from '@nestjs/swagger';

import { BasePaginatedResponseDTO } from '@/common/dtos/base-paginated-response.dto';

import { FeedbackResponseDTO } from './feedback-response.dto';

export class FeedbacksPaginatedResponseDTO extends BasePaginatedResponseDTO<FeedbackResponseDTO> {
  @ApiProperty({ type: [FeedbackResponseDTO] })
  declare data: FeedbackResponseDTO[];
}
