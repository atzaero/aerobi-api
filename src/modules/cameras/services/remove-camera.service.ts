import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';

import { CameraResponseDTO } from '../dtos/camera-response.dto';
import { CameraMapper } from '../mappers/camera.mapper';
import { CameraRepository } from '../repositories/camera.repository';

export type RemoveCameraServiceInput = { id: string; deletedBy: string };

/**
 * Remove (soft delete) uma câmera. O `GroupScopeGuard` já garantiu o escopo;
 * aqui a existência (404) e o soft-delete com o ator real (`deletedBy`).
 */
@Injectable()
export class RemoveCameraService {
  constructor(
    private readonly repo: CameraRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(input: RemoveCameraServiceInput): Promise<CameraResponseDTO> {
    const existing = await this.repo.findById(input.id);
    if (!existing) {
      throw resourceNotFound(this.errorMessageService, 'Câmera', input.id);
    }
    const deleted = await this.repo.softDelete(input.id, input.deletedBy);
    return CameraMapper.toApiRow(deleted);
  }
}
