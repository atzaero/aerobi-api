import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { TrimOptionalString } from '@/common/transform';
import { IsYmdDate } from '@/common/validators/is-ymd-date.validator';
import { ContactMessageStatus, ContactType } from '@/generated/prisma/client';

/** Query `GET /contact/export` — mesmos filtros da listagem, sem paginação. */
export class ExportContactsQueryDTO {
  @ApiPropertyOptional({ enum: ContactType })
  @IsOptional()
  @IsEnum(ContactType)
  type?: ContactType;

  @ApiPropertyOptional({ enum: ContactMessageStatus })
  @IsOptional()
  @IsEnum(ContactMessageStatus)
  status?: ContactMessageStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional()
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
}
