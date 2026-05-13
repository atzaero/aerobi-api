import { ApiProperty } from '@nestjs/swagger';

import { UserSummaryDto } from './user-summary.dto';

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT access token (RS256).' })
  accessToken!: string;

  @ApiProperty({ format: 'date-time' })
  accessExpiresAt!: string;

  @ApiProperty({ description: 'JWT refresh token (RS256, persistido).' })
  refreshToken!: string;

  @ApiProperty({ format: 'date-time' })
  refreshExpiresAt!: string;

  @ApiProperty({ type: () => UserSummaryDto })
  user!: UserSummaryDto;
}
