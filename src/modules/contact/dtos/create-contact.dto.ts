import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import {
  NormalizeEmail,
  NormalizeOptionalPhone,
  TrimString,
} from '@/common/transform';
import { IsE164Phone } from '@/common/validators/is-e164-phone.validator';
import { ContactType } from '@/generated/prisma/client';

import { CONTACT_SESSION_HASH_REGEX } from '../constants/contact-list.constants';

/** Body `POST /contact` — formulário público "Fale conosco". */
export class CreateContactDTO {
  @ApiProperty({ format: 'email' })
  @NormalizeEmail()
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({ minLength: 2, maxLength: 120 })
  @TrimString()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiProperty({
    description: 'Telefone em E.164 (+DDI…)',
    example: '+5511999999999',
  })
  @NormalizeOptionalPhone()
  @IsE164Phone()
  phone!: string;

  @ApiProperty({ minLength: 10, maxLength: 2000 })
  @TrimString()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  message!: string;

  @ApiProperty({ enum: ContactType })
  @IsEnum(ContactType)
  type!: ContactType;

  @ApiPropertyOptional({ description: 'Honeypot — deve ficar vazio' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ description: 'Identificador anônimo de sessão (anti-spam)' })
  @TrimString()
  @IsString()
  @IsNotEmpty()
  @Matches(CONTACT_SESSION_HASH_REGEX, {
    message: 'sessionHash deve ser SHA-256 hexadecimal (64 caracteres)',
  })
  sessionHash!: string;

  @ApiProperty({
    description: 'Epoch ms no client quando o formulário foi aberto',
    example: 1_700_000_000_000,
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  formOpenedAt!: number;
}
