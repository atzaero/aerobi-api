import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { getErrorMessage } from '@/common/utils/error.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { StorageService } from '@/modules/storage/services/storage.service';

import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import { AerodromeGroupMapper } from '../mappers/aerodrome-group.mapper';
import { AerodromeGroupImageRepository } from '../repositories/aerodrome-group-image.repository';
import { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';
import {
  buildAerodromeGroupImageKey,
  detectImageMimetype,
  isAllowedImageMimetype,
  MAX_GROUP_IMAGE_SIZE_BYTES,
} from '../utils/aerodrome-group-image';
import { resolveAerodromeGroupImageUrl } from '../utils/resolve-aerodrome-group-image-url';

@Injectable()
export class UploadAerodromeGroupImageService {
  private readonly logger = new Logger(UploadAerodromeGroupImageService.name);

  constructor(
    private readonly groupRepo: AerodromeGroupRepository,
    private readonly imageRepo: AerodromeGroupImageRepository,
    private readonly storage: StorageService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    groupId: string,
    image: Express.Multer.File | undefined,
    actor: AuthenticatedUser,
  ): Promise<AerodromeGroupResponseDTO> {
    /** Existência checada aqui — o `GroupScopeGuard` faz bypass para ADMIN. */
    const group = await this.groupRepo.findById(groupId);
    if (!group) {
      throw this.notFound(groupId, 'Grupo de aeródromos');
    }

    if (!image) {
      throw this.validation('a imagem é obrigatória (campo `image`)');
    }
    if (image.size === 0) {
      throw this.validation('a imagem não pode estar vazia (0 bytes)');
    }
    if (!isAllowedImageMimetype(image.mimetype)) {
      throw this.validation('a imagem deve ser jpg, png ou webp');
    }
    if (image.size > MAX_GROUP_IMAGE_SIZE_BYTES) {
      throw this.validation('a imagem excede o limite de 5 MB');
    }
    /**
     * O `mimetype` do Multer vem do header `Content-Type` da parte multipart e é
     * forjável; valida o conteúdo real por magic bytes e cruza com o declarado.
     * Rejeita bytes arbitrários, polyglots e extensão/tipo divergente.
     */
    if (detectImageMimetype(image.buffer) !== image.mimetype) {
      throw this.validation(
        'o conteúdo do arquivo não corresponde a uma imagem jpg, png ou webp',
      );
    }

    const key = buildAerodromeGroupImageKey(groupId, image.mimetype);

    try {
      await this.storage.upload(image, key);
    } catch (err) {
      const msg = getErrorMessage(err);
      this.logger.error(
        `Falha no upload da imagem do grupo ${groupId}: ${msg}`,
      );
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.STORAGE_UPLOAD_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.STORAGE_UPLOAD_FAILED,
      );
    }

    try {
      await this.imageRepo.createActiveImage({
        groupId,
        imageKey: key,
        originalFilename: image.originalname,
        mimeType: image.mimetype,
        sizeBytes: image.size,
        actorId: actor.id,
      });
    } catch (err) {
      /** Compensação: o registro falhou após o upload — remove o objeto órfão. */
      await this.storage.delete(key).catch((delErr: unknown) => {
        const msg = getErrorMessage(delErr);
        this.logger.warn(`Falha ao limpar imagem órfã ${key}: ${msg}`);
      });
      throw err;
    }

    const updated = (await this.groupRepo.findById(groupId)) ?? group;
    const imageUrl = await resolveAerodromeGroupImageUrl(
      this.storage,
      updated.imageKey,
    );
    return AerodromeGroupMapper.toApiRow(updated, imageUrl);
  }

  private validation(details: string): CustomHttpException {
    return new CustomHttpException(
      this.errorMessageService.getMessage(ErrorCode.VALIDATION_FAILED, {
        DETAILS: details,
      }),
      HttpStatus.BAD_REQUEST,
      ErrorCode.VALIDATION_FAILED,
    );
  }

  private notFound(id: string, resource: string): CustomHttpException {
    return new CustomHttpException(
      this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
        RESOURCE: resource,
        ID: id,
      }),
      HttpStatus.NOT_FOUND,
      ErrorCode.RESOURCE_NOT_FOUND,
    );
  }
}
