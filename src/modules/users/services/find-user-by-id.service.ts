import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { UserResponseDto } from '../dtos/user-response.dto';
import { toUserResponse } from '../mappers/user.mapper';
import { UserRepository } from '../repositories/user.repository';
import { assertSelfOrAdmin } from '../utils/user-access.util';

@Injectable()
export class FindUserByIdService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    id: string,
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

    return toUserResponse(user);
  }
}
