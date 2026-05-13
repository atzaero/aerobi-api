import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsString } from 'class-validator';

export class LogoutRequestDto {
  @ApiProperty({ description: 'JWT refresh token a revogar.' })
  @IsString()
  @IsJWT()
  refreshToken!: string;
}
