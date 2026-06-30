import { Body, Controller, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ChangePasswordDocs } from '../docs/change-password.docs';
import { ChangePasswordRequestDto } from '../dtos/change-password-request.dto';
import { ChangePasswordResponseDto } from '../dtos/change-password-response.dto';
import { ChangePasswordService } from '../services/change-password.service';

/**
 * Troca de senha pelo próprio usuário (`POST /users/me/change-password`).
 * Apenas `JwtAuthGuard` — alvo é sempre `@CurrentUser`.
 */
@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class ChangePasswordController {
  constructor(private readonly service: ChangePasswordService) {}

  @ChangePasswordDocs()
  handle(
    @Body() dto: ChangePasswordRequestDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<ChangePasswordResponseDto> {
    return this.service.execute(actor, dto);
  }
}
