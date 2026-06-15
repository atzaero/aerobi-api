import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import { CameraResponseDTO } from '../dtos/camera-response.dto';
import { CameraMapper } from '../mappers/camera.mapper';
import { CameraRepository } from '../repositories/camera.repository';

/**
 * Lista as câmeras **ativas** de um aeródromo (por ICAO), lendo direto do
 * Firestore. Não usa o cache do `CameraResolverService` (a listagem é pouco
 * frequente e deve refletir o cadastro atual; o cache só protege o proxy, que é
 * chamado por segmento).
 */
@Injectable()
export class ListAerodromeCamerasService {
  private readonly logger = new Logger(ListAerodromeCamerasService.name);

  constructor(
    private readonly repository: CameraRepository,
    private readonly errorMessage: ErrorMessageService,
  ) {}

  async execute(icao: string): Promise<CameraResponseDTO[]> {
    let cameras;
    try {
      cameras = await this.repository.findEnabledByIcao(icao);
    } catch (error) {
      /** Falha de conectividade/credenciais do Firestore é serviço externo → 502. */
      this.logger.warn(
        `Falha ao listar câmeras de ${icao} no Firestore: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw new CustomHttpException(
        this.errorMessage.getMessage(ErrorCode.EXTERNAL_SERVICE_FAILED, {
          SERVICE: 'Firestore',
        }),
        HttpStatus.BAD_GATEWAY,
        ErrorCode.EXTERNAL_SERVICE_FAILED,
      );
    }
    return cameras.map((camera) => CameraMapper.toResponse(camera));
  }
}
