import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsString } from 'class-validator';

export class RefreshRequestDto {
  @ApiProperty({ description: 'JWT refresh token recebido no login.' })
  @IsString()
  @IsJWT()
  refreshToken!: string;
}
