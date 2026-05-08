import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';

import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import { TechnicalVisitMapper } from '../mappers/technical-visit.mapper';
import { TechnicalVisitRepository } from '../repositories/technical-visit.repository';

export type RemoveTechnicalVisitServiceInput = {
  id: string;
  deletedBy: string;
};

@Injectable()
export class RemoveTechnicalVisitService {
  constructor(
    private readonly repo: TechnicalVisitRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: RemoveTechnicalVisitServiceInput,
  ): Promise<TechnicalVisitResponseDTO> {
    const existing = await this.repo.findById(input.id);
    if (!existing) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'Visita técnica',
          ID: input.id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    const deleted = await this.repo.softDelete(input.id, input.deletedBy);
    return TechnicalVisitMapper.toApiRow(deleted);
  }
}
