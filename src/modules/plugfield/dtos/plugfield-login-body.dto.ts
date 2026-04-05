import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PlugfieldLoginBodyDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'secret' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
