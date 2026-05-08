import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';
import type { Prisma } from '@/generated/prisma/client';

import { OperationalAerodromeResponseDTO } from '../dtos/operational-aerodrome-response.dto';
import { UpdateOperationalAerodromeDTO } from '../dtos/update-operational-aerodrome.dto';
import { OperationalAerodromeMapper } from '../mappers/operational-aerodrome.mapper';
import { OperationalAerodromeRepository } from '../repositories/operational-aerodrome.repository';

export type UpdateOperationalAerodromeServiceInput =
  UpdateOperationalAerodromeDTO & { id: string };

function patchToPrisma(
  dto: UpdateOperationalAerodromeDTO,
): Prisma.OperationalAerodromeUpdateInput {
  const data: Prisma.OperationalAerodromeUpdateInput = {};
  if (dto.icao !== undefined) data.icao = dto.icao;
  if (dto.ciad !== undefined) data.ciad = dto.ciad;
  if (dto.designation !== undefined) data.designation = dto.designation;
  if (dto.length !== undefined) data.length = dto.length;
  if (dto.width !== undefined) data.width = dto.width;
  if (dto.resistance !== undefined) data.resistance = dto.resistance;
  if (dto.surface !== undefined) data.surface = dto.surface;
  if (dto.altitude !== undefined) data.altitude = dto.altitude;
  if (dto.name !== undefined) data.name = dto.name;
  if (dto.municipality !== undefined) data.municipality = dto.municipality;
  if (dto.latitude !== undefined) data.latitude = dto.latitude;
  if (dto.longitude !== undefined) data.longitude = dto.longitude;
  if (dto.latitudeFormatted !== undefined) {
    data.latitudeFormatted = dto.latitudeFormatted;
  }
  if (dto.longitudeFormatted !== undefined) {
    data.longitudeFormatted = dto.longitudeFormatted;
  }
  if (dto.operation !== undefined) data.operation = dto.operation;
  if (dto.lit !== undefined) data.lit = dto.lit;
  if (dto.fueling !== undefined) data.fueling = dto.fueling;
  if (dto.observation !== undefined) data.observation = dto.observation;
  if (dto.construction !== undefined) data.construction = dto.construction;
  if (dto.isOpen !== undefined) data.isOpen = dto.isOpen;
  if (dto.isView !== undefined) data.isView = dto.isView;
  if (dto.weatherStationCode !== undefined) {
    data.weatherStationCode = dto.weatherStationCode;
  }
  if (dto.weatherStationDisplay !== undefined) {
    data.weatherStationDisplay = dto.weatherStationDisplay;
  }
  if (dto.fileType !== undefined) data.fileType = dto.fileType;
  if (dto.imgUrl !== undefined) data.imgUrl = dto.imgUrl;
  if (dto.kmlUrl !== undefined) data.kmlUrl = dto.kmlUrl;
  if (dto.registrationOrdinanceUrl !== undefined) {
    data.registrationOrdinanceUrl = dto.registrationOrdinanceUrl;
  }
  if (dto.planOrdinanceUrl !== undefined) {
    data.planOrdinanceUrl = dto.planOrdinanceUrl;
  }
  if (dto.grantTermUrl !== undefined) data.grantTermUrl = dto.grantTermUrl;
  if (dto.aeronauticalStudyUrl !== undefined) {
    data.aeronauticalStudyUrl = dto.aeronauticalStudyUrl;
  }
  if (dto.weatherUrl !== undefined) data.weatherUrl = dto.weatherUrl;
  if (dto.windUrl !== undefined) data.windUrl = dto.windUrl;
  if (dto.videoUrl !== undefined) data.videoUrl = dto.videoUrl;
  return data;
}

@Injectable()
export class UpdateOperationalAerodromeService {
  constructor(
    private readonly repo: OperationalAerodromeRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: UpdateOperationalAerodromeServiceInput,
  ): Promise<OperationalAerodromeResponseDTO> {
    const { id, groupId, ...dto } = input;
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'Aeródromo operacional',
          ID: id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    const patch = patchToPrisma(dto);
    if (groupId !== undefined) {
      patch.group = { connect: { id: groupId } };
    }

    const updated = await this.repo.update(id, patch);
    return OperationalAerodromeMapper.toApiRow(updated);
  }
}
