import { Injectable } from '@nestjs/common';

import { OperationalAerodromeResponseDTO } from '../dtos/operational-aerodrome-response.dto';
import { CreateOperationalAerodromeDTO } from '../dtos/create-operational-aerodrome.dto';
import { OperationalAerodromeMapper } from '../mappers/operational-aerodrome.mapper';
import { buildOperationalAerodromeCreateInput } from '../mappers/operational-aerodrome.prisma.mapper';
import { OperationalAerodromeRepository } from '../repositories/operational-aerodrome.repository';

@Injectable()
export class CreateOperationalAerodromeService {
  constructor(private readonly repo: OperationalAerodromeRepository) {}

  async execute(
    dto: CreateOperationalAerodromeDTO,
  ): Promise<OperationalAerodromeResponseDTO> {
    const created = await this.repo.create(
      buildOperationalAerodromeCreateInput(dto),
    );
    return OperationalAerodromeMapper.toApiRow(created);
  }
}
