import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';
import type { Prisma } from '@/generated/prisma/client';

import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import { UpdateAerodromeGroupDTO } from '../dtos/update-aerodrome-group.dto';
import { AerodromeGroupMapper } from '../mappers/aerodrome-group.mapper';
import { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';

export type UpdateAerodromeGroupServiceInput = UpdateAerodromeGroupDTO & {
  id: string;
};

function patchToPrisma(
  dto: UpdateAerodromeGroupDTO,
): Prisma.AerodromeGroupUpdateInput {
  const data: Prisma.AerodromeGroupUpdateInput = {};
  if (dto.uf !== undefined) data.uf = dto.uf;
  if (dto.groupName !== undefined) data.groupName = dto.groupName;
  if (dto.ownerId !== undefined) data.ownerId = dto.ownerId;
  if (dto.deletionRequested !== undefined) {
    data.deletionRequested = dto.deletionRequested;
  }
  return data;
}

@Injectable()
export class UpdateAerodromeGroupService {
  constructor(
    private readonly repo: AerodromeGroupRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: UpdateAerodromeGroupServiceInput,
  ): Promise<AerodromeGroupResponseDTO> {
    const { id, ...dto } = input;
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'Grupo de aeródromos',
          ID: id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    const updated = await this.repo.update(id, patchToPrisma(dto));
    return AerodromeGroupMapper.toApiRow(updated);
  }
}
