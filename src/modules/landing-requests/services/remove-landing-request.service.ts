import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';

import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';
import { LandingRequestMapper } from '../mappers/landing-request.mapper';
import { LandingRequestRepository } from '../repositories/landing-request.repository';

export type RemoveLandingRequestServiceInput = {
  id: string;
  deletedBy: string;
};

@Injectable()
export class RemoveLandingRequestService {
  constructor(
    private readonly repo: LandingRequestRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: RemoveLandingRequestServiceInput,
  ): Promise<LandingRequestResponseDTO> {
    const existing = await this.repo.findById(input.id);
    if (!existing) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'Pedido de pouso',
          ID: input.id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    const deleted = await this.repo.softDelete(input.id, input.deletedBy);
    return LandingRequestMapper.toApiRow(deleted);
  }
}
