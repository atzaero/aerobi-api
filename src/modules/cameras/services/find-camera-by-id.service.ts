import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';

import { CameraResponseDTO } from '../dtos/camera-response.dto';
import { CameraMapper } from '../mappers/camera.mapper';
import { CameraRepository } from '../repositories/camera.repository';

export type FindCameraByIdServiceInput = { id: string };

/**
 * Busca uma câmera por id. O escopo por grupo (404-fora-do-escopo) é garantido
 * pelo `GroupScopeGuard` no controller; aqui só o 404 de inexistência.
 */
@Injectable()
export class FindCameraByIdService {
  constructor(
    private readonly repo: CameraRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(input: FindCameraByIdServiceInput): Promise<CameraResponseDTO> {
    const entity = await this.repo.findById(input.id);
    if (!entity) {
      throw resourceNotFound(this.errorMessageService, 'Câmera', input.id);
    }
    return CameraMapper.toApiRow(entity);
  }
}
