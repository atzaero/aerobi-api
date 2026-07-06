import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GuessParamDTO {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  id!: string;
}
