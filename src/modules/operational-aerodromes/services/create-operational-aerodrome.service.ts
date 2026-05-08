import { Injectable } from '@nestjs/common';

import type { Prisma } from '@/generated/prisma/client';

import { OperationalAerodromeResponseDTO } from '../dtos/operational-aerodrome-response.dto';
import { CreateOperationalAerodromeDTO } from '../dtos/create-operational-aerodrome.dto';
import { OperationalAerodromeMapper } from '../mappers/operational-aerodrome.mapper';
import { OperationalAerodromeRepository } from '../repositories/operational-aerodrome.repository';

@Injectable()
export class CreateOperationalAerodromeService {
  constructor(private readonly repo: OperationalAerodromeRepository) {}

  async execute(
    dto: CreateOperationalAerodromeDTO,
  ): Promise<OperationalAerodromeResponseDTO> {
    const { groupId, ...fields } = dto;
    const data = {
      ...fields,
      group: { connect: { id: groupId } },
    } satisfies Prisma.OperationalAerodromeCreateInput;

    const created = await this.repo.create(data);
    return OperationalAerodromeMapper.toApiRow(created);
  }
}
