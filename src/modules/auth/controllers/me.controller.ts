import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CurrentUser } from '../decorators/current-user.decorator';
import { MeResponseDto } from '../dtos/me-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { AuthResponseMapperService } from '../services/auth-response-mapper.service';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MeController {
  constructor(private readonly mapper: AuthResponseMapperService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Dados do usuário autenticado (a partir do JWT)',
    description:
      'Retorna apenas claims do JWT — sem round-trip ao DB. Para dados ' +
      'completos do usuário, usar `GET /users/:id` (módulo users).',
  })
  @ApiResponse({ status: 200, type: MeResponseDto })
  @ApiUnauthorizedResponse()
  handle(@CurrentUser() user: AuthenticatedUser): MeResponseDto {
    return this.mapper.toMeResponse(user);
  }
}
