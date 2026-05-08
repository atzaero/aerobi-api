import { OmitType, PartialType } from '@nestjs/swagger';

import { CreateTechnicalVisitDTO } from './create-technical-visit.dto';

export class UpdateTechnicalVisitDTO extends PartialType(
  OmitType(CreateTechnicalVisitDTO, ['createdBy'] as const),
) {}
