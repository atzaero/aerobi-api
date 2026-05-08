import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';

import { PilotLandingResponseDTO } from '../dtos/pilot-landing-response.dto';
import { PilotLandingMapper } from '../mappers/pilot-landing.mapper';
import { PilotLandingRepository } from '../repositories/pilot-landing.repository';

export type RemovePilotLandingServiceInput = { id: string; deletedBy: string };

@Injectable()
export class RemovePilotLandingService {
  constructor(
    private readonly repo: PilotLandingRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: RemovePilotLandingServiceInput,
  ): Promise<PilotLandingResponseDTO> {
    const existing = await this.repo.findById(input.id);
    if (!existing) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'Registo de pouso',
          ID: input.id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    const deleted = await this.repo.softDelete(input.id, input.deletedBy);
    return PilotLandingMapper.toApiRow(deleted);
  }
}
