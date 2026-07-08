import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';

import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import { TechnicalVisitRepository } from '../repositories/technical-visit.repository';
import { toTechnicalVisitApiRow } from '../utils/technical-visit-response';
import { UserRepository } from '@/modules/users/repositories/user.repository';

export type FindTechnicalVisitByIdServiceInput = { id: string };

@Injectable()
export class FindTechnicalVisitByIdService {
  constructor(
    private readonly repo: TechnicalVisitRepository,
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: FindTechnicalVisitByIdServiceInput,
  ): Promise<TechnicalVisitResponseDTO> {
    const entity = await this.repo.findByIdWithAerodrome(input.id);
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
    return toTechnicalVisitApiRow(this.userRepository, entity);
  }
}
