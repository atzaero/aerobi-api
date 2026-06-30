import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';

import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import { UpdateTechnicalVisitDTO } from '../dtos/update-technical-visit.dto';
import { TechnicalVisitMapper } from '../mappers/technical-visit.mapper';
import { patchTechnicalVisitToPrisma } from '../mappers/technical-visit.prisma.mapper';
import { TechnicalVisitRepository } from '../repositories/technical-visit.repository';

export type UpdateTechnicalVisitServiceInput = UpdateTechnicalVisitDTO & {
  id: string;
};

@Injectable()
export class UpdateTechnicalVisitService {
  constructor(
    private readonly repo: TechnicalVisitRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: UpdateTechnicalVisitServiceInput,
  ): Promise<TechnicalVisitResponseDTO> {
    const { id, aerodromeId, ...dto } = input;

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

    const patch = patchTechnicalVisitToPrisma(dto);
    if (aerodromeId !== undefined) {
      patch.aerodrome = {
        connect: { id: aerodromeId },
      };
    }

    const updated = await this.repo.update(id, patch);
    return TechnicalVisitMapper.toApiRow(updated);
  }
}
