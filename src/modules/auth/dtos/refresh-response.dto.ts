import { ApiProperty } from '@nestjs/swagger';

export class RefreshResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({ format: 'date-time' })
  accessExpiresAt!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty({ format: 'date-time' })
  refreshExpiresAt!: string;
}
