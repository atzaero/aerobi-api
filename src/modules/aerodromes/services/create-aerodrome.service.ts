import { Injectable } from '@nestjs/common';

import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import { CreateAerodromeDTO } from '../dtos/create-aerodrome.dto';
import { AerodromeMapper } from '../mappers/aerodrome.mapper';
import { buildAerodromeCreateInput } from '../mappers/aerodrome.prisma.mapper';
import { AerodromeRepository } from '../repositories/aerodrome.repository';

@Injectable()
export class CreateAerodromeService {
  constructor(private readonly repo: AerodromeRepository) {}

  async execute(dto: CreateAerodromeDTO): Promise<AerodromeResponseDTO> {
    const created = await this.repo.create(buildAerodromeCreateInput(dto));
    return AerodromeMapper.toApiRow(created);
  }
}
