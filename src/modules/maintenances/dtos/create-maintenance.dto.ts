import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

/**
 * Body para POST /maintenances.
 */
export class CreateMaintenanceDTO {
  @ApiProperty({ example: 'Reforma da pista principal' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  name!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  aerodromeId!: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'E-mails autorizados ao acesso público.',
  })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  @ArrayUnique()
  authorizedEmails?: string[];
}
