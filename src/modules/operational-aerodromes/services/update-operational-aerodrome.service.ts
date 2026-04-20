import { Injectable, NotFoundException } from '@nestjs/common';

import { OperationalAerodromeResponseDTO } from '../dtos/operational-aerodrome-response.dto';
import { UpdateOperationalAerodromeDTO } from '../dtos/update-operational-aerodrome.dto';
import { OperationalAerodromeMapper } from '../mappers/operational-aerodrome.mapper';
import { OperationalAerodromeRepository } from '../repositories/operational-aerodrome.repository';

export type UpdateOperationalAerodromeServiceInput =
  UpdateOperationalAerodromeDTO & { id: string };

@Injectable()
export class UpdateOperationalAerodromeService {
  constructor(private readonly repo: OperationalAerodromeRepository) {}

  async execute(
    input: UpdateOperationalAerodromeServiceInput,
  ): Promise<OperationalAerodromeResponseDTO> {
    // TODO: implementar
    const { id, ...data } = input;
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException(`OperationalAerodrome ${id} not found`);
    }
    const updated = await this.repo.update(id, data as never);
    return OperationalAerodromeMapper.toApiRow(updated);
  }
}
