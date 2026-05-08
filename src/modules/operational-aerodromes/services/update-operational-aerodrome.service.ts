import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';

import { OperationalAerodromeResponseDTO } from '../dtos/operational-aerodrome-response.dto';
import { UpdateOperationalAerodromeDTO } from '../dtos/update-operational-aerodrome.dto';
import { OperationalAerodromeMapper } from '../mappers/operational-aerodrome.mapper';
import { patchOperationalAerodromeToPrisma } from '../mappers/operational-aerodrome.prisma.mapper';
import { OperationalAerodromeRepository } from '../repositories/operational-aerodrome.repository';

export type UpdateOperationalAerodromeServiceInput =
  UpdateOperationalAerodromeDTO & { id: string };

@Injectable()
export class UpdateOperationalAerodromeService {
  constructor(
    private readonly repo: OperationalAerodromeRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: UpdateOperationalAerodromeServiceInput,
  ): Promise<OperationalAerodromeResponseDTO> {
    const { id, groupId, ...dto } = input;
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'Aeródromo operacional',
          ID: id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    const patch = patchOperationalAerodromeToPrisma(dto);
    if (groupId !== undefined) {
      patch.group = { connect: { id: groupId } };
    }

    const updated = await this.repo.update(id, patch);
    return OperationalAerodromeMapper.toApiRow(updated);
  }
}
