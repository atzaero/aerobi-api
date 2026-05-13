import { ApiProperty } from '@nestjs/swagger';

export class PasswordResetResponseDto {
  @ApiProperty({
    description:
      'Mensagem genérica — sempre OK para evitar user enumeration na rota request.',
  })
  message!: string;
}
