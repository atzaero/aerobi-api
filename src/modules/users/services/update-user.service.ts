import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';

import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { UpdateUserRequestDto } from '../dtos/update-user-request.dto';
import type { UserResponseDto } from '../dtos/user-response.dto';
import { toUserResponse } from '../mappers/user.mapper';
import { UserRepository } from '../repositories/user.repository';
import { assertSelfOrAdmin } from '../utils/user-access.util';

@Injectable()
export class UpdateUserService {
  private readonly logger = new Logger(UpdateUserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    id: string,
    dto: UpdateUserRequestDto,
    actor: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    assertSelfOrAdmin(actor, id, this.errorMessageService);

    const user = await this.userRepository.findActiveById(id);
    if (!user) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.USER_NOT_FOUND, {
          ID: id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.USER_NOT_FOUND,
      );
    }

    if (dto.role !== undefined && actor.role !== UserRole.ADMIN) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.ROLE_CHANGE_FORBIDDEN),
        HttpStatus.FORBIDDEN,
        ErrorCode.ROLE_CHANGE_FORBIDDEN,
      );
    }

    const updated = await this.userRepository.update(id, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.timezone !== undefined && { timezone: dto.timezone }),
      ...(dto.role !== undefined && { role: dto.role }),
      updatedBy: actor.id,
    });

    this.logger.log(`User updated id=${id} updatedBy=${actor.id}`);
    return toUserResponse(updated);
  }
}
