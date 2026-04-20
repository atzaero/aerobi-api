import { Injectable, NotFoundException } from '@nestjs/common';

import { OperationalAerodromeResponseDTO } from '../dtos/operational-aerodrome-response.dto';
import { OperationalAerodromeMapper } from '../mappers/operational-aerodrome.mapper';
import { OperationalAerodromeRepository } from '../repositories/operational-aerodrome.repository';

export type FindOperationalAerodromeByIdServiceInput = { id: string };

@Injectable()
export class FindOperationalAerodromeByIdService {
  constructor(private readonly repo: OperationalAerodromeRepository) {}

  async execute(
    input: FindOperationalAerodromeByIdServiceInput,
  ): Promise<OperationalAerodromeResponseDTO> {
    // TODO: implementar
    const entity = await this.repo.findById(input.id);
    if (!entity) {
      throw new NotFoundException(`OperationalAerodrome ${input.id} not found`);
    }
    return OperationalAerodromeMapper.toApiRow(entity);
  }
}
