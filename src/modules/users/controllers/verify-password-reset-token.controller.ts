import { Body, Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { VerifyPasswordResetTokenDocs } from '../docs/verify-password-reset-token.docs';
import { VerifyPasswordResetTokenDto } from '../dtos/verify-password-reset-token.dto';
import { VerifyPasswordResetTokenService } from '../services/verify-password-reset-token.service';

@ApiTags('Users')
@Controller('users')
export class VerifyPasswordResetTokenController {
  constructor(private readonly service: VerifyPasswordResetTokenService) {}

  @VerifyPasswordResetTokenDocs()
  handle(
    @Body() dto: VerifyPasswordResetTokenDto,
  ): Promise<{ valid: boolean }> {
    return this.service.execute(dto);
  }
}
