import { OmitType, PartialType } from '@nestjs/swagger';

import { CreateAerodromeDTO } from './create-aerodrome.dto';

export class UpdateAerodromeDTO extends PartialType(
  OmitType(CreateAerodromeDTO, ['createdBy'] as const),
) {}
