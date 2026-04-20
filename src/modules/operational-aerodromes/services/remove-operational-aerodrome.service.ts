import { Injectable, NotFoundException } from '@nestjs/common';

import { OperationalAerodromeResponseDTO } from '../dtos/operational-aerodrome-response.dto';
import { OperationalAerodromeMapper } from '../mappers/operational-aerodrome.mapper';
import { OperationalAerodromeRepository } from '../repositories/operational-aerodrome.repository';

export type RemoveOperationalAerodromeServiceInput = {
  id: string;
  deletedBy: string;
};

@Injectable()
export class RemoveOperationalAerodromeService {
  constructor(private readonly repo: OperationalAerodromeRepository) {}

  async execute(
    input: RemoveOperationalAerodromeServiceInput,
  ): Promise<OperationalAerodromeResponseDTO> {
    // TODO: implementar (soft delete)
    const existing = await this.repo.findById(input.id);
    if (!existing) {
      throw new NotFoundException(`OperationalAerodrome ${input.id} not found`);
    }
    const deleted = await this.repo.softDelete(input.id, input.deletedBy);
    return OperationalAerodromeMapper.toApiRow(deleted);
  }
}
