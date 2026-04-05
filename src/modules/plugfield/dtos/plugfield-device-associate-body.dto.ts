import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class PlugfieldDeviceAssociateBodyDto {
  @ApiPropertyOptional({
    description: 'Identificador da estação (alternativa a `code`).',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  deviceId?: string;

  @ApiPropertyOptional({
    description: 'Código da estação (alternativa a `deviceId`).',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  code?: string;
}
