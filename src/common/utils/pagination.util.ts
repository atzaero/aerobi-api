import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetadataUtil {
  @ApiProperty({
    example: 1,
    description: 'Current page number',
  })
  currentPage: number;

  @ApiProperty({
    example: 10,
    description: 'Number of items per page',
  })
  itemsPerPage: number;

  @ApiProperty({
    example: 100,
    description: 'Total number of items',
  })
  totalItems: number;

  @ApiProperty({
    example: 10,
    description: 'Total number of pages',
  })
  totalPages: number;

  @ApiProperty({
    example: true,
    description: 'Whether there is a next page',
  })
  hasNextPage: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether there is a previous page',
  })
  hasPreviousPage: boolean;

  constructor(currentPage: number, itemsPerPage: number, totalItems: number) {
    this.currentPage = currentPage;
    this.itemsPerPage = itemsPerPage;
    this.totalItems = totalItems;
    this.totalPages = Math.ceil(totalItems / itemsPerPage);
    this.hasNextPage = currentPage < this.totalPages;
    this.hasPreviousPage = currentPage > 1;
  }
}

export class PaginatedResultUtil<T> {
  @ApiProperty({
    description: 'Array of items',
    isArray: true,
  })
  data: T[];

  @ApiProperty({
    type: PaginationMetadataUtil,
    description: 'Pagination metadata',
  })
  meta: PaginationMetadataUtil;

  constructor(
    data: T[],
    currentPage: number,
    itemsPerPage: number,
    totalItems: number,
  ) {
    this.data = data;
    this.meta = new PaginationMetadataUtil(
      currentPage,
      itemsPerPage,
      totalItems,
    );
  }

  static create<T>(
    data: T[],
    currentPage: number,
    itemsPerPage: number,
    totalItems: number,
  ): PaginatedResultUtil<T> {
    return new PaginatedResultUtil(data, currentPage, itemsPerPage, totalItems);
  }
}
