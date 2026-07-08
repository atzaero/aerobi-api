import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { getErrorMessage } from '@/common/utils/error.util';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import type { TechnicalVisitImageSection } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { StorageService } from '@/modules/storage/services/storage.service';

import { TechnicalVisitImageResponseDTO } from '../dtos/technical-visit-image-response.dto';
import { TechnicalVisitImageMapper } from '../mappers/technical-visit-image.mapper';
import { TechnicalVisitImageRepository } from '../repositories/technical-visit-image.repository';
import { TechnicalVisitRepository } from '../repositories/technical-visit.repository';
import {
  buildTechnicalVisitImageKey,
  detectImageMimetype,
  isAllowedImageMimetype,
  MAX_TECHNICAL_VISIT_IMAGE_BYTES,
} from '../utils/technical-visit-image';

@Injectable()
export class AddTechnicalVisitImageService {
  private readonly logger = new Logger(AddTechnicalVisitImageService.name);

  constructor(
    private readonly visitRepo: TechnicalVisitRepository,
    private readonly imageRepo: TechnicalVisitImageRepository,
    private readonly storage: StorageService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    technicalVisitId: string,
    section: TechnicalVisitImageSection,
    image: Express.Multer.File | undefined,
    actor: AuthenticatedUser,
  ): Promise<TechnicalVisitImageResponseDTO> {
    const visit = await this.visitRepo.findById(technicalVisitId);
    if (!visit) {
      throw resourceNotFound(
        this.errorMessageService,
        'Visita técnica',
        technicalVisitId,
      );
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
    if (image.size > MAX_TECHNICAL_VISIT_IMAGE_BYTES) {
      throw this.validation('a imagem excede o limite de 5 MB');
    }
    if (detectImageMimetype(image.buffer) !== image.mimetype) {
      throw this.validation(
        'o conteúdo do arquivo não corresponde a uma imagem jpg, png ou webp',
      );
    }

    const key = buildTechnicalVisitImageKey(
      technicalVisitId,
      section,
      image.mimetype,
    );

    try {
      await this.storage.upload(image, key);
    } catch (err) {
      const msg = getErrorMessage(err);
      this.logger.error(
        `Falha no upload da imagem da visita ${technicalVisitId}: ${msg}`,
      );
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.STORAGE_UPLOAD_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.STORAGE_UPLOAD_FAILED,
      );
    }

    try {
      const created = await this.imageRepo.create({
        technicalVisit: { connect: { id: technicalVisitId } },
        section,
        imageKey: key,
        originalFilename: image.originalname,
        mimeType: image.mimetype,
        sizeBytes: image.size,
        uploadedBy: actor.id,
        createdBy: actor.id,
        updatedBy: actor.id,
      });
      return TechnicalVisitImageMapper.toApiRow(this.storage, created);
    } catch (err) {
      try {
        await this.storage.delete(key);
      } catch (cleanupErr) {
        this.logger.error(
          `Falha ao remover objeto órfão ${key}: ${getErrorMessage(cleanupErr)}`,
        );
      }
      throw err;
    }
  }

  private validation(message: string): CustomHttpException {
    return new CustomHttpException(
      this.errorMessageService.getMessage(ErrorCode.VALIDATION_FAILED, {
        MESSAGE: message,
      }),
      HttpStatus.BAD_REQUEST,
      ErrorCode.VALIDATION_FAILED,
    );
  }
}
