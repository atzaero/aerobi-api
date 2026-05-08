import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';

import { PilotLandingResponseDTO } from '../dtos/pilot-landing-response.dto';
import { UpdatePilotLandingDTO } from '../dtos/update-pilot-landing.dto';
import { PilotLandingMapper } from '../mappers/pilot-landing.mapper';
import { patchPilotLandingToPrisma } from '../mappers/pilot-landing.prisma.mapper';
import { PilotLandingRepository } from '../repositories/pilot-landing.repository';

export type UpdatePilotLandingServiceInput = UpdatePilotLandingDTO & {
  id: string;
};

@Injectable()
export class UpdatePilotLandingService {
  constructor(
    private readonly repo: PilotLandingRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: UpdatePilotLandingServiceInput,
  ): Promise<PilotLandingResponseDTO> {
    const { id, ...raw } = input;
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'Registo de pouso',
          ID: id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    const data = patchPilotLandingToPrisma(raw);
    const updated = await this.repo.update(id, data);
    return PilotLandingMapper.toApiRow(updated);
  }
}
