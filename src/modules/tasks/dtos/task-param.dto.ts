import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class TaskParamDTO {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  id!: string;
}
