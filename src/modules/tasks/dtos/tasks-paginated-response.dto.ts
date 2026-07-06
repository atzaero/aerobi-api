import { ApiProperty } from '@nestjs/swagger';

import { BasePaginatedResponseDTO } from '@/common/dtos/base-paginated-response.dto';

import { TaskResponseDTO } from './task.dto';

export class TasksPaginatedResponseDTO extends BasePaginatedResponseDTO<TaskResponseDTO> {
  @ApiProperty({ type: [TaskResponseDTO] })
  declare data: TaskResponseDTO[];
}
