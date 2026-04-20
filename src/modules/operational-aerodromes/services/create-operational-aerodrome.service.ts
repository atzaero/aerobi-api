import { Injectable } from '@nestjs/common';

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
    // TODO: implementar
    const created = await this.repo.create(dto as never);
    return OperationalAerodromeMapper.toApiRow(created);
  }
}
