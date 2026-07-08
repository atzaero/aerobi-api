import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class TechnicalVisitImageParamDTO {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  technicalVisitId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  imageId!: string;
}
