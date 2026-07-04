import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { httpError } from '@/common/exceptions/http-error.util';
import { getErrorMessage } from '@/common/utils/error.util';
import { AnacHttpService } from '@/modules/anac/services/anac-http.service';
import { AnacScraperService } from '@/modules/anac/services/anac-scraper.service';

import { formatCpfForAnac } from '../utils/format-cpf-for-anac.util';

/**
 * Valida a licença do piloto na ANAC durante o create público (espelha
 * `validate-pilot-license.ts` do web): formata o CPF (`XXX.XXX.XXX-XX`), consulta
 * e raspa o resultado. Reusa os services internos do módulo `anac/` — não faz
 * chamada HTTP à própria API.
 *
 * Licença inválida → `VALIDATION_FAILED` (400); ANAC fora do ar / falha de
 * parsing → `EXTERNAL_SERVICE_FAILED` (502).
 */
@Injectable()
export class ValidatePilotLicenseService {
  private readonly logger = new Logger(ValidatePilotLicenseService.name);

  constructor(
    private readonly anacHttp: AnacHttpService,
    private readonly anacScraper: AnacScraperService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(pilotCpf: string, anacPilotCode: string): Promise<void> {
    const cpf = formatCpfForAnac(pilotCpf);

    let valido: boolean;
    try {
      const html = await this.anacHttp.fetchLicenseData(cpf, anacPilotCode);
      const result = await this.anacScraper.scrapeLicenseData(
        html,
        anacPilotCode,
      );
      valido = result.valido;
    } catch (err) {
      this.logger.warn(`Consulta ANAC indisponível: ${getErrorMessage(err)}`);
      throw httpError(
        this.errorMessageService,
        ErrorCode.EXTERNAL_SERVICE_FAILED,
        HttpStatus.BAD_GATEWAY,
        { SERVICE: 'ANAC' },
      );
    }

    if (!valido) {
      throw httpError(
        this.errorMessageService,
        ErrorCode.VALIDATION_FAILED,
        HttpStatus.BAD_REQUEST,
        { DETAILS: 'informe um piloto com carteira válida (CPF e CANAC)' },
      );
    }
  }
}
