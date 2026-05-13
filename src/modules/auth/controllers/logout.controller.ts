import { Body, Controller, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { LogoutDocs } from '../docs/logout.docs';
import { LogoutRequestDto } from '../dtos/logout-request.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthLogoutService } from '../services/auth-logout.service';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(JwtAuthGuard)
export class LogoutController {
  constructor(private readonly authLogoutService: AuthLogoutService) {}

  @LogoutDocs()
  async handle(@Body() dto: LogoutRequestDto): Promise<void> {
    await this.authLogoutService.execute(dto.refreshToken);
  }
}
