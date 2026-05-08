import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class BaseAerodromeGroupParamDTO {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Identificador do(a) AerodromeGroup',
  })
  @IsUUID()
  @IsNotEmpty()
  aerodromeGroupId!: string;
}
