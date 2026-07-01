import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';

import { GeojsonResponseDTO } from '../dtos/geojson-response.dto';
import { UpdateGeojsonDTO } from '../dtos/update-geojson.dto';
import { GeojsonMapper } from '../mappers/geojson.mapper';
import { patchGeojsonToPrisma } from '../mappers/geojson.prisma.mapper';
import { GeojsonRepository } from '../repositories/geojson.repository';

export type UpdateGeojsonServiceInput = UpdateGeojsonDTO & {
  id: string;
};

@Injectable()
export class UpdateGeojsonService {
  constructor(
    private readonly repo: GeojsonRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(input: UpdateGeojsonServiceInput): Promise<GeojsonResponseDTO> {
    const { id, aerodromeId, ...dto } = input;
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

    const patch = patchGeojsonToPrisma(dto);
    if (aerodromeId !== undefined) {
      patch.aerodrome = {
        connect: { id: aerodromeId },
      };
    }

    const updated = await this.repo.update(id, patch);
    return GeojsonMapper.toApiRow(updated);
  }
}
