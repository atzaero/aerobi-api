import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import { GuessStatus } from '@/generated/prisma/client';
import { MaintenanceGuessRepository } from '@/modules/guesses/repositories/maintenance-guess.repository';
import { isEmailAuthorized } from '@/modules/guesses/utils/is-email-authorized.util';
import { MaintenanceTaskRepository } from '@/modules/tasks/repositories/maintenance-task.repository';

import {
  CreatePublicGuessDTO,
  CreatePublicGuessResponseDTO,
} from '../dtos/public/create-public-guess.dto';
import { MaintenanceRepository } from '../repositories/maintenance.repository';
import { isMaintenancePublicAccess } from '../utils/maintenance-domain.util';

@Injectable()
export class CreatePublicMaintenanceGuessService {
  constructor(
    private readonly maintenanceRepo: MaintenanceRepository,
    private readonly taskRepo: MaintenanceTaskRepository,
    private readonly guessRepo: MaintenanceGuessRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    maintenanceId: string,
    dto: CreatePublicGuessDTO,
  ): Promise<CreatePublicGuessResponseDTO> {
    const maintenance = await this.maintenanceRepo.findById(maintenanceId);
    if (!maintenance || !isMaintenancePublicAccess(maintenance)) {
      throw resourceNotFound(
        this.errorMessageService,
        'Manutenção',
        maintenanceId,
      );
    }

    if (maintenance.securityCode !== dto.securityCode) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.UNAUTHORIZED),
        HttpStatus.UNAUTHORIZED,
        ErrorCode.UNAUTHORIZED,
      );
    }

    if (!isEmailAuthorized(dto.email, maintenance.authorizedEmails)) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.UNAUTHORIZED),
        HttpStatus.UNAUTHORIZED,
        ErrorCode.UNAUTHORIZED,
      );
    }

    const task = await this.taskRepo.findById(dto.taskId);
    if (!task || task.maintenanceId !== maintenanceId) {
      throw resourceNotFound(this.errorMessageService, 'Tarefa', dto.taskId);
    }

    const created = await this.guessRepo.create({
      text: dto.text.trim(),
      email: dto.email.trim(),
      status: GuessStatus.PENDING,
      task: { connect: { id: dto.taskId } },
    });

    const response = new CreatePublicGuessResponseDTO();
    response.id = created.id;
    response.taskId = created.taskId;
    return response;
  }
}
