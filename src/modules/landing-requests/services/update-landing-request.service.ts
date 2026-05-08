import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';

import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';
import { UpdateLandingRequestDTO } from '../dtos/update-landing-request.dto';
import { LandingRequestMapper } from '../mappers/landing-request.mapper';
import { patchLandingRequestToPrisma } from '../mappers/landing-request.prisma.mapper';
import { LandingRequestRepository } from '../repositories/landing-request.repository';

export type UpdateLandingRequestServiceInput = UpdateLandingRequestDTO & {
  id: string;
};

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
    const updated = await this.repo.update(
      id,
      patchLandingRequestToPrisma(dto),
    );
    return LandingRequestMapper.toApiRow(updated);
  }
}
