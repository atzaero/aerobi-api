import { OmitType, PartialType } from '@nestjs/swagger';

import { CreateAerodromeGeojsonDTO } from './create-aerodrome-geojson.dto';

export class UpdateAerodromeGeojsonDTO extends PartialType(
  OmitType(CreateAerodromeGeojsonDTO, ['createdBy'] as const),
) {}
