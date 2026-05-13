import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { LogoutRequestDto } from '../dtos/logout-request.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthLogoutService } from '../services/auth-logout.service';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LogoutController {
  constructor(private readonly authLogoutService: AuthLogoutService) {}

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Revoga o refresh apresentado',
    description:
      'Idempotente — sempre retorna 204, mesmo se o refresh já estava ' +
      'revogado ou inválido. O access token expira sozinho pelo TTL.',
  })
  @ApiBody({ type: LogoutRequestDto })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async handle(@Body() dto: LogoutRequestDto): Promise<void> {
    await this.authLogoutService.execute(dto.refreshToken);
  }
}
