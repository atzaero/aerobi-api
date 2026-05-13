import { ApiProperty } from '@nestjs/swagger';

import { BasePaginatedResponseDTO } from '@/common/dtos/base-paginated-response.dto';

import { UserResponseDto } from './user-response.dto';

export class UsersPaginatedResponseDto extends BasePaginatedResponseDTO<UserResponseDto> {
  @ApiProperty({ type: [UserResponseDto] })
  declare data: UserResponseDto[];
}
