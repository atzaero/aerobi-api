import { ApiProperty } from '@nestjs/swagger';

import { BasePaginatedResponseDTO } from '@/common/dtos/base-paginated-response.dto';

import { MaintenanceListItemResponseDTO } from './maintenance-response.dto';

export class MaintenancesPaginatedResponseDTO extends BasePaginatedResponseDTO<MaintenanceListItemResponseDTO> {
  @ApiProperty({ type: [MaintenanceListItemResponseDTO] })
  declare data: MaintenanceListItemResponseDTO[];
}
