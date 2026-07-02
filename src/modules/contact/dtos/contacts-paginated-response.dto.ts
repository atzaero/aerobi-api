import { ApiProperty } from '@nestjs/swagger';

import { BasePaginatedResponseDTO } from '@/common/dtos/base-paginated-response.dto';

import { ContactResponseDTO } from './contact-response.dto';

export class ContactsPaginatedResponseDTO extends BasePaginatedResponseDTO<ContactResponseDTO> {
  @ApiProperty({ type: [ContactResponseDTO] })
  declare data: ContactResponseDTO[];
}
