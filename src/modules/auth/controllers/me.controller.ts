import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../decorators/current-user.decorator';
import { MeDocs } from '../docs/me.docs';
import { MeResponseDto } from '../dtos/me-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { AuthResponseMapperService } from '../services/auth-response-mapper.service';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly mapper: AuthResponseMapperService) {}

  @MeDocs()
  handle(@CurrentUser() user: AuthenticatedUser): MeResponseDto {
    return this.mapper.toMeResponse(user);
  }
}
