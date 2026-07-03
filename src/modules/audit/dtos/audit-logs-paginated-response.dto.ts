import { ApiProperty } from '@nestjs/swagger';

import { BasePaginatedResponseDTO } from '@/common/dtos/base-paginated-response.dto';

import { AuditLogResponseDto } from './audit-log-response.dto';

export class AuditLogsPaginatedResponseDto extends BasePaginatedResponseDTO<AuditLogResponseDto> {
  @ApiProperty({ type: [AuditLogResponseDto] })
  declare data: AuditLogResponseDto[];
}
