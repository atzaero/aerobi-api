import { Body, Controller, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { UpdateProfileDocs } from '../docs/update-profile.docs';
import { UpdateProfileRequestDto } from '../dtos/update-profile-request.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UpdateProfileService } from '../services/update-profile.service';

/**
 * Auto-edição de perfil (`PATCH /users/me`). Apenas `JwtAuthGuard` — qualquer
 * usuário autenticado edita o próprio registro (alvo = `@CurrentUser`). Deve ser
 * registrado **antes** de `UpdateUserController` (`PATCH /users/:id`) para que a
 * rota estática `me` tenha precedência sobre a paramétrica `:id`.
 */
@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UpdateProfileController {
  constructor(private readonly service: UpdateProfileService) {}

  @UpdateProfileDocs()
  handle(
    @Body() dto: UpdateProfileRequestDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    return this.service.execute(actor, dto);
  }
}
