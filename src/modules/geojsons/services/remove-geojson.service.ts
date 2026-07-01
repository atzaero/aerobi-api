import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';

import { GeojsonResponseDTO } from '../dtos/geojson-response.dto';
import { GeojsonMapper } from '../mappers/geojson.mapper';
import { GeojsonRepository } from '../repositories/geojson.repository';

export type RemoveGeojsonServiceInput = {
  id: string;
  deletedBy: string;
};

@Injectable()
export class RemoveGeojsonService {
  constructor(
    private readonly repo: GeojsonRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(input: RemoveGeojsonServiceInput): Promise<GeojsonResponseDTO> {
    const existing = await this.repo.findById(input.id);
    if (!existing) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'GeoJSON operacional',
          ID: input.id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    const deleted = await this.repo.softDelete(input.id, input.deletedBy);
    return GeojsonMapper.toApiRow(deleted);
  }
}
