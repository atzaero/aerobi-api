import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';

import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import { TechnicalVisitMapper } from '../mappers/technical-visit.mapper';
import { TechnicalVisitRepository } from '../repositories/technical-visit.repository';

export type FindTechnicalVisitByIdServiceInput = { id: string };

@Injectable()
export class FindTechnicalVisitByIdService {
  constructor(
    private readonly repo: TechnicalVisitRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: FindTechnicalVisitByIdServiceInput,
  ): Promise<TechnicalVisitResponseDTO> {
    const entity = await this.repo.findById(input.id);
    if (!entity) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'Visita técnica',
          ID: input.id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    return TechnicalVisitMapper.toApiRow(entity);
  }
}
