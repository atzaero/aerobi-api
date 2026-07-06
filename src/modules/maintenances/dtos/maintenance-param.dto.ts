import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class MaintenanceParamDTO {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  id!: string;
}
