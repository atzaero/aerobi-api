import { ApiProperty } from '@nestjs/swagger';

import { UserSummaryDto } from '@/modules/auth/dtos/user-summary.dto';

export class AcceptInviteResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({ format: 'date-time' })
  accessExpiresAt!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty({ format: 'date-time' })
  refreshExpiresAt!: string;

  @ApiProperty({ type: () => UserSummaryDto })
  user!: UserSummaryDto;
}
