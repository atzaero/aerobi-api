import { Injectable } from '@nestjs/common';

import { LoginResponseDto } from '../dtos/login-response.dto';
import { MeResponseDto } from '../dtos/me-response.dto';
import { RefreshResponseDto } from '../dtos/refresh-response.dto';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

import type { LoginResult } from './auth-login.service';
import type { RefreshSessionResult } from './auth-refresh-session.service';

/**
 * Mapper isolado para deixar os controllers livres de detalhes de
 * formato — facilita também mudar a forma de resposta (ex: cookies vs
 * body) sem mexer no caso de uso.
 */
@Injectable()
export class AuthResponseMapperService {
  toLoginResponse(result: LoginResult): LoginResponseDto {
    return {
      accessToken: result.accessToken,
      accessExpiresAt: result.accessExpiresAt.toISOString(),
      refreshToken: result.refreshToken,
      refreshExpiresAt: result.refreshExpiresAt.toISOString(),
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      },
    };
  }

  toRefreshResponse(result: RefreshSessionResult): RefreshResponseDto {
    return {
      accessToken: result.accessToken,
      accessExpiresAt: result.accessExpiresAt.toISOString(),
      refreshToken: result.refreshToken,
      refreshExpiresAt: result.refreshExpiresAt.toISOString(),
    };
  }

  toMeResponse(user: AuthenticatedUser): MeResponseDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
