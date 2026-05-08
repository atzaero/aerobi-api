import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';
import type { Prisma } from '@/generated/prisma/client';

import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';
import { UpdateLandingRequestDTO } from '../dtos/update-landing-request.dto';
import { LandingRequestMapper } from '../mappers/landing-request.mapper';
import { LandingRequestRepository } from '../repositories/landing-request.repository';

export type UpdateLandingRequestServiceInput = UpdateLandingRequestDTO & {
  id: string;
};

function patchToPrisma(
  dto: UpdateLandingRequestDTO,
): Prisma.LandingRequestUpdateInput {
  const data: Prisma.LandingRequestUpdateInput = {};
  if (dto.status !== undefined) data.status = dto.status;
  if (dto.requestDate !== undefined) data.requestDate = dto.requestDate;
  if (dto.email !== undefined) data.email = dto.email;
  if (dto.pilotCode !== undefined) data.pilotCode = dto.pilotCode;
  if (dto.aircraftModel !== undefined) {
    data.aircraftModel = dto.aircraftModel;
  }
  if (dto.aircraftRegistration !== undefined) {
    data.aircraftRegistration = dto.aircraftRegistration;
  }
  if (dto.departureAerodrome !== undefined) {
    data.departureAerodrome = dto.departureAerodrome;
  }
  if (dto.observation !== undefined) data.observation = dto.observation;
  if (dto.reviewedAt !== undefined) data.reviewedAt = dto.reviewedAt;
  if (dto.reviewedBy !== undefined) data.reviewedBy = dto.reviewedBy;

  if (dto.operationalAerodromeId !== undefined) {
    data.operationalAerodrome = {
      connect: { id: dto.operationalAerodromeId },
    };
  }
  return data;
}

@Injectable()
export class UpdateLandingRequestService {
  constructor(
    private readonly repo: LandingRequestRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: UpdateLandingRequestServiceInput,
  ): Promise<LandingRequestResponseDTO> {
    const { id, ...dto } = input;
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'Pedido de pouso',
          ID: id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    const updated = await this.repo.update(id, patchToPrisma(dto));
    return LandingRequestMapper.toApiRow(updated);
  }
}
