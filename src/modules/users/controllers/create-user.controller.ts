import { Body, Controller, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UserRole } from '@/generated/prisma/client';

import { CreateUserDocs } from '../docs/create-user.docs';
import { CreateUserRequestDto } from '../dtos/create-user-request.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { CreateUserService } from '../services/create-user.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CreateUserController {
  constructor(private readonly service: CreateUserService) {}

  @CreateUserDocs()
  @Roles(UserRole.ADMIN)
  handle(
    @Body() dto: CreateUserRequestDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    return this.service.execute({
      ...dto,
      actorId: actor.id,
    });
  }
}
