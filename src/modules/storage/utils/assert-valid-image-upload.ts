import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import type { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import { detectImageMimetype, isAllowedImageMimetype } from './image-mimetype';

/**
 * Constrói uma exceção `VALIDATION_FAILED` (400) interpolando o detalhe no
 * placeholder `[DETAILS]` do template. A chave tem de ser `DETAILS` (não
 * `MESSAGE`), caso contrário o motivo específico não é substituído na resposta.
 */
function validationFailed(
  errorMessageService: ErrorMessageService,
  details: string,
): CustomHttpException {
  return new CustomHttpException(
    errorMessageService.getMessage(ErrorCode.VALIDATION_FAILED, {
      DETAILS: details,
    }),
    HttpStatus.BAD_REQUEST,
    ErrorCode.VALIDATION_FAILED,
  );
}

/**
 * Opções de validação do upload de imagem. `maxBytes` é o teto aceito para o
 * arquivo; a mensagem de excesso reporta o limite arredondado para MiB
 * inteiros, então prefira múltiplos de 1 MiB (ex.: `5 * 1024 * 1024`).
 */
export interface AssertValidImageUploadOptions {
  maxBytes: number;
}

/**
 * Valida de forma centralizada um upload de imagem multipart, encapsulando os
 * cinco checks antes copiados entre `groups` e `technical-visits`: presença,
 * tamanho não-nulo, mimetype declarado na allowlist, teto de bytes e conteúdo
 * real por magic bytes. O último cruza o resultado de `detectImageMimetype` com
 * o `mimetype` do Multer (que vem do header `Content-Type` do cliente, logo
 * forjável) e fecha o vetor de tipo declarado divergente do conteúdo. Lança
 * `VALIDATION_FAILED` (400) com o detalhe específico; caso contrário estreita
 * `image` para `Express.Multer.File` (não-undefined) no chamador.
 */
export function assertValidImageUpload(
  image: Express.Multer.File | undefined,
  errorMessageService: ErrorMessageService,
  { maxBytes }: AssertValidImageUploadOptions,
): asserts image is Express.Multer.File {
  if (!image) {
    throw validationFailed(
      errorMessageService,
      'a imagem é obrigatória (campo `image`)',
    );
  }
  if (image.size === 0) {
    throw validationFailed(
      errorMessageService,
      'a imagem não pode estar vazia (0 bytes)',
    );
  }
  if (!isAllowedImageMimetype(image.mimetype)) {
    throw validationFailed(
      errorMessageService,
      'a imagem deve ser jpg, png ou webp',
    );
  }
  if (image.size > maxBytes) {
    const maxMb = Math.round(maxBytes / (1024 * 1024));
    throw validationFailed(
      errorMessageService,
      `a imagem excede o limite de ${maxMb} MB`,
    );
  }
  if (detectImageMimetype(image.buffer) !== image.mimetype) {
    throw validationFailed(
      errorMessageService,
      'o conteúdo do arquivo não corresponde a uma imagem jpg, png ou webp',
    );
  }
}
