import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * Body para PATCH /maintenances/:id.
 */
export class UpdateMaintenanceDTO {
  @ApiProperty({ example: 'Reforma da pista principal' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  name!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  @ArrayUnique()
  authorizedEmails?: string[];

  @ApiPropertyOptional({
    description:
      'Regenera o código de segurança quando há e-mails autorizados.',
  })
  @IsOptional()
  @IsBoolean()
  regenerateSecurityCode?: boolean;
}
