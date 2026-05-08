import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';
import type { Prisma } from '@/generated/prisma/client';

import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import { UpdateTechnicalVisitDTO } from '../dtos/update-technical-visit.dto';
import { TechnicalVisitMapper } from '../mappers/technical-visit.mapper';
import { TechnicalVisitRepository } from '../repositories/technical-visit.repository';

export type UpdateTechnicalVisitServiceInput = UpdateTechnicalVisitDTO & {
  id: string;
};

function patchToPrisma(
  dto: UpdateTechnicalVisitDTO,
): Prisma.TechnicalVisitUpdateInput {
  const data: Prisma.TechnicalVisitUpdateInput = {};
  if (dto.modifierUsers !== undefined) data.modifierUsers = dto.modifierUsers;
  if (dto.gatesPadlocksObservation !== undefined) {
    data.gatesPadlocksObservation = dto.gatesPadlocksObservation;
  }
  if (dto.hasGatesPadlocks !== undefined) {
    data.hasGatesPadlocks = dto.hasGatesPadlocks;
  }
  if (dto.fenceObservation !== undefined) {
    data.fenceObservation = dto.fenceObservation;
  }
  if (dto.hasFence !== undefined) data.hasFence = dto.hasFence;
  if (dto.standardPlateObservation !== undefined) {
    data.standardPlateObservation = dto.standardPlateObservation;
  }
  if (dto.hasStandardPlate !== undefined) {
    data.hasStandardPlate = dto.hasStandardPlate;
  }
  if (dto.qualityObservation !== undefined) {
    data.qualityObservation = dto.qualityObservation;
  }
  if (dto.qualityOthersObservation !== undefined) {
    data.qualityOthersObservation = dto.qualityOthersObservation;
  }
  if (dto.hasQualityHoles !== undefined) {
    data.hasQualityHoles = dto.hasQualityHoles;
  }
  if (dto.hasQualityAsphalt !== undefined) {
    data.hasQualityAsphalt = dto.hasQualityAsphalt;
  }
  if (dto.hasQualityOthers !== undefined) {
    data.hasQualityOthers = dto.hasQualityOthers;
  }
  if (dto.horizontalSignageObservation !== undefined) {
    data.horizontalSignageObservation = dto.horizontalSignageObservation;
  }
  if (dto.hasHorizontalSignage !== undefined) {
    data.hasHorizontalSignage = dto.hasHorizontalSignage;
  }
  if (dto.unobstructedHeadboardsObservation !== undefined) {
    data.unobstructedHeadboardsObservation =
      dto.unobstructedHeadboardsObservation;
  }
  if (dto.hasUnobstructedHeadboards !== undefined) {
    data.hasUnobstructedHeadboards = dto.hasUnobstructedHeadboards;
  }
  if (dto.trackRangeObservation !== undefined) {
    data.trackRangeObservation = dto.trackRangeObservation;
  }
  if (dto.hasTrackRange !== undefined) data.hasTrackRange = dto.hasTrackRange;
  if (dto.pavementRegularity !== undefined) {
    data.pavementRegularity = dto.pavementRegularity;
  }
  if (dto.trashDebrisObservation !== undefined) {
    data.trashDebrisObservation = dto.trashDebrisObservation;
  }
  if (dto.hasTrashDebris !== undefined) {
    data.hasTrashDebris = dto.hasTrashDebris;
  }
  if (dto.delimitedPerimeterObservation !== undefined) {
    data.delimitedPerimeterObservation = dto.delimitedPerimeterObservation;
  }
  if (dto.hasDelimitedPerimeter !== undefined) {
    data.hasDelimitedPerimeter = dto.hasDelimitedPerimeter;
  }
  if (dto.hasInvasion !== undefined) data.hasInvasion = dto.hasInvasion;
  if (dto.extraObservation !== undefined) {
    data.extraObservation = dto.extraObservation;
  }
  if (dto.visitAt !== undefined) data.visitAt = dto.visitAt;
  if (dto.visitBy !== undefined) data.visitBy = dto.visitBy;
  return data;
}

@Injectable()
export class UpdateTechnicalVisitService {
  constructor(
    private readonly repo: TechnicalVisitRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: UpdateTechnicalVisitServiceInput,
  ): Promise<TechnicalVisitResponseDTO> {
    const { id, operationalAerodromeId, ...dto } = input;

    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'Visita técnica',
          ID: id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    const patch = patchToPrisma(dto);
    if (operationalAerodromeId !== undefined) {
      patch.operationalAerodrome = {
        connect: { id: operationalAerodromeId },
      };
    }

    const updated = await this.repo.update(id, patch);
    return TechnicalVisitMapper.toApiRow(updated);
  }
}
