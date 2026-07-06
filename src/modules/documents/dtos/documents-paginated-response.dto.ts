import { ApiProperty } from '@nestjs/swagger';

import { BasePaginatedResponseDTO } from '@/common/dtos/base-paginated-response.dto';

import { DocumentResponseDTO } from './document-response.dto';

export class DocumentsPaginatedResponseDTO extends BasePaginatedResponseDTO<DocumentResponseDTO> {
  @ApiProperty({ type: [DocumentResponseDTO] })
  declare data: DocumentResponseDTO[];
}
