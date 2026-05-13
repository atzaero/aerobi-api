import { Body, Controller, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { UpdateUserDocs } from '../docs/update-user.docs';
import { UpdateUserRequestDto } from '../dtos/update-user-request.dto';
import { UserIdParamDto } from '../dtos/user-id-param.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UpdateUserService } from '../services/update-user.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UpdateUserController {
  constructor(private readonly service: UpdateUserService) {}

  @UpdateUserDocs()
  handle(
    @Param() { id }: UserIdParamDto,
    @Body() dto: UpdateUserRequestDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    return this.service.execute(id, dto, actor);
  }
}
