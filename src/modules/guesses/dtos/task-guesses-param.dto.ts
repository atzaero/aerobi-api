import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class TaskGuessesParamDTO {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  taskId!: string;
}
