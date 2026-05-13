import { Controller, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { FindUserByIdDocs } from '../docs/find-user-by-id.docs';
import { UserIdParamDto } from '../dtos/user-id-param.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { FindUserByIdService } from '../services/find-user-by-id.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class FindUserByIdController {
  constructor(private readonly service: FindUserByIdService) {}

  @FindUserByIdDocs()
  handle(
    @Param() { id }: UserIdParamDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    return this.service.execute(id, actor);
  }
}
