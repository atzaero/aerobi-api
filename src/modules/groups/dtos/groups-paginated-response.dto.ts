import { ApiProperty } from '@nestjs/swagger';

import { BasePaginatedResponseDTO } from '@/common/dtos/base-paginated-response.dto';

import { GroupResponseDTO } from './group-response.dto';

export class GroupsPaginatedResponseDTO extends BasePaginatedResponseDTO<GroupResponseDTO> {
  @ApiProperty({ type: [GroupResponseDTO] })
  declare data: GroupResponseDTO[];
}
