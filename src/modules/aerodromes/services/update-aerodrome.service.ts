import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';

import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import { UpdateAerodromeDTO } from '../dtos/update-aerodrome.dto';
import { AerodromeMapper } from '../mappers/aerodrome.mapper';
import { patchAerodromeToPrisma } from '../mappers/aerodrome.prisma.mapper';
import { AerodromeRepository } from '../repositories/aerodrome.repository';

export type UpdateAerodromeServiceInput = UpdateAerodromeDTO & { id: string };

@Injectable()
export class UpdateAerodromeService {
  constructor(
    private readonly repo: AerodromeRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: UpdateAerodromeServiceInput,
  ): Promise<AerodromeResponseDTO> {
    const { id, groupId, ...dto } = input;
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'Aeródromo',
          ID: id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    const patch = patchAerodromeToPrisma(dto);
    if (groupId !== undefined) {
      patch.group = { connect: { id: groupId } };
    }

    const updated = await this.repo.update(id, patch);
    return AerodromeMapper.toApiRow(updated);
  }
}
