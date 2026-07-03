import { ApiProperty } from '@nestjs/swagger';

import { BasePaginatedResponseDTO } from '@/common/dtos/base-paginated-response.dto';

import { CameraResponseDTO } from './camera-response.dto';

export class CamerasPaginatedResponseDTO extends BasePaginatedResponseDTO<CameraResponseDTO> {
  @ApiProperty({ type: [CameraResponseDTO] })
  declare data: CameraResponseDTO[];
}
