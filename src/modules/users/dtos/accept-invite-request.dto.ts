import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { IsStrongPassword } from '@/common/validators/is-strong-password.validator';

export class AcceptInviteRequestDto {
  @ApiProperty({
    description: 'Email do convidado (presente no link de convite enviado).',
    format: 'email',
  })
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @ApiProperty({ description: 'Plain token recebido pelo link de convite.' })
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  token!: string;

  @ApiProperty({
    description:
      'Nova senha definida pelo convidado. Mínimo 8 chars, letras + números.',
  })
  @IsStrongPassword()
  password!: string;

  @ApiPropertyOptional({ description: 'Sobrescreve o nome se informado.' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;
}
