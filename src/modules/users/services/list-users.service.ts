import { Injectable } from '@nestjs/common';

import { resolvePaginationParams } from '@/common/utils/pagination-params.util';

import type { ListUsersQueryDto } from '../dtos/list-users-query.dto';
import { UsersPaginatedResponseDto } from '../dtos/users-paginated-response.dto';
import { toUserResponse } from '../mappers/user.mapper';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class ListUsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: ListUsersQueryDto): Promise<UsersPaginatedResponseDto> {
    const { page, limit, skip } = resolvePaginationParams(query, 100);

    const { rows, total } = await this.userRepository.findManyPaginated({
      skip,
      take: limit,
      ...(query.search !== undefined && { search: query.search }),
      ...(query.role !== undefined && { role: query.role }),
    });

    return new UsersPaginatedResponseDto(
      rows.map(toUserResponse),
      page,
      limit,
      total,
    );
  }
}
