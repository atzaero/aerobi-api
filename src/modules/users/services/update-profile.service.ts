import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { UpdateProfileRequestDto } from '../dtos/update-profile-request.dto';
import type { UserResponseDto } from '../dtos/user-response.dto';
import { toUserResponse } from '../mappers/user.mapper';
import { UserRepository } from '../repositories/user.repository';

/**
 * Auto-edição de perfil (`PATCH /users/me`) — espelha `update-profile` do
 * `aerobi-web`. Qualquer usuário autenticado edita os próprios `name`/`phone`/
 * `timezone`. A troca de senha (com verificação da atual) fica em
 * `POST /users/me/change-password`; `email`/`role` são mudança administrativa.
 */
@Injectable()
export class UpdateProfileService {
  private readonly logger = new Logger(UpdateProfileService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    actor: AuthenticatedUser,
    dto: UpdateProfileRequestDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findActiveById(actor.id);

    /** Token ainda válido mas conta soft-deletada (a JwtStrategy não revalida). */
    if (!user) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.ACCOUNT_DELETED),
        HttpStatus.UNAUTHORIZED,
        ErrorCode.ACCOUNT_DELETED,
      );
    }

    const updated = await this.userRepository.update(actor.id, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.timezone !== undefined && { timezone: dto.timezone }),
      updatedBy: actor.id,
    });

    this.logger.log(`Profile updated by self id=${actor.id}`);
    return toUserResponse(updated);
  }
}
