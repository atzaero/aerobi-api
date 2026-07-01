import { OmitType, PartialType } from '@nestjs/swagger';

import { CreateGeojsonDTO } from './create-geojson.dto';

export class UpdateGeojsonDTO extends PartialType(
  OmitType(CreateGeojsonDTO, ['createdBy'] as const),
) {}
