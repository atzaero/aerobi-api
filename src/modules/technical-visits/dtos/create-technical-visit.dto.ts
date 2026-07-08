import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

import { TechnicalVisitFormFieldsDTO } from './technical-visit-form-fields.dto';
import { TECHNICAL_VISIT_EXAMPLE_AERODROME_ID } from '../docs/technical-visit.examples';

export class CreateTechnicalVisitDTO extends TechnicalVisitFormFieldsDTO {
  @ApiProperty({
    format: 'uuid',
    example: TECHNICAL_VISIT_EXAMPLE_AERODROME_ID,
  })
  @IsUUID('4')
  aerodromeId!: string;
}
