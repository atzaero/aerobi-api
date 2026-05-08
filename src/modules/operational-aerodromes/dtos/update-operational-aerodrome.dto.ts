import { OmitType, PartialType } from '@nestjs/swagger';

import { CreateOperationalAerodromeDTO } from './create-operational-aerodrome.dto';

export class UpdateOperationalAerodromeDTO extends PartialType(
  OmitType(CreateOperationalAerodromeDTO, ['createdBy'] as const),
) {}
