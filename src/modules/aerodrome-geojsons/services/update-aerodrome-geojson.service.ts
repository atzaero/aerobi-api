import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';

import { AerodromeGeojsonResponseDTO } from '../dtos/aerodrome-geojson-response.dto';
import { UpdateAerodromeGeojsonDTO } from '../dtos/update-aerodrome-geojson.dto';
import { AerodromeGeojsonMapper } from '../mappers/aerodrome-geojson.mapper';
import { patchAerodromeGeojsonToPrisma } from '../mappers/aerodrome-geojson.prisma.mapper';
import { AerodromeGeojsonRepository } from '../repositories/aerodrome-geojson.repository';

export type UpdateAerodromeGeojsonServiceInput = UpdateAerodromeGeojsonDTO & {
  id: string;
};

@Injectable()
export class UpdateAerodromeGeojsonService {
  constructor(
    private readonly repo: AerodromeGeojsonRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: UpdateAerodromeGeojsonServiceInput,
  ): Promise<AerodromeGeojsonResponseDTO> {
    const { id, operationalAerodromeId, ...dto } = input;
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'GeoJSON operacional',
          ID: id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    const patch = patchAerodromeGeojsonToPrisma(dto);
    if (operationalAerodromeId !== undefined) {
      patch.operationalAerodrome = {
        connect: { id: operationalAerodromeId },
      };
    }

    const updated = await this.repo.update(id, patch);
    return AerodromeGeojsonMapper.toApiRow(updated);
  }
}
