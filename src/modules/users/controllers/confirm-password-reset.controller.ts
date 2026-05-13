import { Body, Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ConfirmPasswordResetDocs } from '../docs/confirm-password-reset.docs';
import { ConfirmPasswordResetDto } from '../dtos/confirm-password-reset.dto';
import { PasswordResetResponseDto } from '../dtos/password-reset-response.dto';
import { ConfirmPasswordResetService } from '../services/confirm-password-reset.service';

@ApiTags('Users')
@Controller('users')
export class ConfirmPasswordResetController {
  constructor(private readonly service: ConfirmPasswordResetService) {}

  @ConfirmPasswordResetDocs()
  handle(
    @Body() dto: ConfirmPasswordResetDto,
  ): Promise<PasswordResetResponseDto> {
    return this.service.execute(dto);
  }
}
