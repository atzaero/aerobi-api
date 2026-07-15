import { PartialType } from '@nestjs/swagger';

import { TechnicalVisitFormFieldsDTO } from './technical-visit-form-fields.dto';

/** Apenas campos do formulário — `aerodromeId` é imutável após criação (#369). */
export class UpdateTechnicalVisitDTO extends PartialType(
  TechnicalVisitFormFieldsDTO,
) {}
