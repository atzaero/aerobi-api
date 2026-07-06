import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';

import { MaintenanceResponseDTO } from '../dtos/maintenance-response.dto';
import { MaintenanceMapper } from '../mappers/maintenance.mapper';
import { MaintenanceRepository } from '../repositories/maintenance.repository';

@Injectable()
export class FindMaintenanceByIdService {
  constructor(
    private readonly repo: MaintenanceRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(id: string): Promise<MaintenanceResponseDTO> {
    const entity = await this.repo.findById(id);
    if (!entity) {
      throw resourceNotFound(this.errorMessageService, 'Manutenção', id);
    }
    return MaintenanceMapper.toApiRow(entity);
  }
}
