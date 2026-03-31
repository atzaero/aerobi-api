import { ApiProperty } from '@nestjs/swagger';

import {
  PaginatedResultUtil,
  PaginationMetadataUtil,
} from '../utils/pagination.util';

export class BasePaginatedResponseDTO<T> extends PaginatedResultUtil<T> {
  @ApiProperty({
    isArray: true,
    description: 'Array of items',
  })
  declare data: T[];

  @ApiProperty({
    type: PaginationMetadataUtil,
    description: 'Pagination metadata',
  })
  declare meta: PaginationMetadataUtil;
}
