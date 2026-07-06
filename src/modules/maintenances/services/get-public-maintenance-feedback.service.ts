import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import { MaintenanceGuessMapper } from '@/modules/guesses/mappers/maintenance-guess.mapper';
import { MaintenanceGuessRepository } from '@/modules/guesses/repositories/maintenance-guess.repository';
import { isEmailAuthorized } from '@/modules/guesses/utils/is-email-authorized.util';
import { MaintenanceTaskMapper } from '@/modules/tasks/mappers/maintenance-task.mapper';
import { MaintenanceTaskRepository } from '@/modules/tasks/repositories/maintenance-task.repository';

import { PublicMaintenanceFeedbackQueryDTO } from '../dtos/public/public-maintenance-feedback-query.dto';
import {
  PublicAerodromeHeaderDTO,
  PublicMaintenanceFeedbackResponseDTO,
  PublicMaintenanceMetaDTO,
} from '../dtos/public/public-maintenance-feedback-response.dto';
import { MaintenanceRepository } from '../repositories/maintenance.repository';
import {
  formatMaintenanceDisplayName,
  isMaintenancePublicAccess,
} from '../utils/maintenance-domain.util';

@Injectable()
export class GetPublicMaintenanceFeedbackService {
  constructor(
    private readonly maintenanceRepo: MaintenanceRepository,
    private readonly taskRepo: MaintenanceTaskRepository,
    private readonly guessRepo: MaintenanceGuessRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    maintenanceId: string,
    query: PublicMaintenanceFeedbackQueryDTO,
  ): Promise<PublicMaintenanceFeedbackResponseDTO> {
    const maintenance = await this.maintenanceRepo.findById(maintenanceId);
    if (!maintenance || !isMaintenancePublicAccess(maintenance)) {
      throw resourceNotFound(
        this.errorMessageService,
        'Manutenção',
        maintenanceId,
      );
    }

    const aerodrome = await this.maintenanceRepo.findActiveAerodrome(
      maintenance.aerodromeId,
    );
    if (!aerodrome) {
      throw resourceNotFound(
        this.errorMessageService,
        'Manutenção',
        maintenanceId,
      );
    }

    const [tasks, guesses] = await Promise.all([
      this.taskRepo.findManyByMaintenanceId(maintenanceId),
      this.guessRepo.findActiveByMaintenanceId(maintenanceId),
    ]);

    const aerodromeDto = new PublicAerodromeHeaderDTO();
    aerodromeDto.id = aerodrome.id;
    aerodromeDto.name = aerodrome.name;
    aerodromeDto.icao = aerodrome.icao ?? '';
    aerodromeDto.uf = aerodrome.group.uf;

    const maintenanceDto = new PublicMaintenanceMetaDTO();
    maintenanceDto.id = maintenance.id;
    maintenanceDto.name = formatMaintenanceDisplayName(maintenance.name);
    maintenanceDto.authorizedEmailsCount = maintenance.authorizedEmails.length;
    maintenanceDto.publicAccessEnabled = isMaintenancePublicAccess(maintenance);

    const submitFlags = this.resolveSubmitFlags(
      query.email,
      maintenance.authorizedEmails,
    );

    const response = new PublicMaintenanceFeedbackResponseDTO();
    response.aerodrome = aerodromeDto;
    response.maintenance = maintenanceDto;
    response.unavailableMessage = null;
    response.tasks = MaintenanceTaskMapper.toApiRows(tasks);
    response.guessesByTaskId = MaintenanceGuessMapper.groupByTaskId(guesses);
    response.emailAuthorized = submitFlags.emailAuthorized;
    response.canSubmitGuess = submitFlags.canSubmitGuess;
    return response;
  }

  private resolveSubmitFlags(
    email: string | undefined,
    authorizedEmails: readonly string[],
  ): Pick<
    PublicMaintenanceFeedbackResponseDTO,
    'emailAuthorized' | 'canSubmitGuess'
  > {
    if (!email) {
      return { emailAuthorized: null, canSubmitGuess: false };
    }
    const emailAuthorized = isEmailAuthorized(email, authorizedEmails);
    return { emailAuthorized, canSubmitGuess: emailAuthorized };
  }
}
