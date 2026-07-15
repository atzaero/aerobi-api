import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';
import { TrimOptionalString } from '@/common/transform';
import { IsYmdDate } from '@/common/validators/is-ymd-date.validator';
import { ContactMessageStatus, ContactType } from '@/generated/prisma/client';

import { CONTACT_LIST_MAX_LIMIT } from '../constants/contact-list.constants';

/** Query `GET /contact` — paginação + filtros de moderação admin. */
export class ListContactsQueryDTO extends BasePaginationQueryDTO {
  @ApiPropertyOptional({ enum: ContactType })
  @IsOptional()
  @IsEnum(ContactType)
  type?: ContactType;

  @ApiPropertyOptional({ enum: ContactMessageStatus })
  @IsOptional()
  @IsEnum(ContactMessageStatus)
  status?: ContactMessageStatus;

  @ApiPropertyOptional({
    description: 'Substring no e-mail (case-insensitive)',
  })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ description: 'Substring nos dígitos do telefone' })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @ApiPropertyOptional({ example: '2026-06-01' })
  @IsOptional()
  @IsYmdDate()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-06-30' })
  @IsOptional()
  @IsYmdDate()
  endDate?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  declare page?: number;

  @ApiPropertyOptional({ example: 20, maximum: CONTACT_LIST_MAX_LIMIT })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(CONTACT_LIST_MAX_LIMIT)
  declare limit?: number;
}
