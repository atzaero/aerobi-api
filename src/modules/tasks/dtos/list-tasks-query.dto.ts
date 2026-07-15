import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IntersectionType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';

const TASK_SITUATIONS = [
  'pending',
  'completed',
  'overdue',
  'completed_late',
] as const;
const TASK_URGENCIES = ['low', 'medium', 'high', 'critical'] as const;
const TASK_FOLLOW_UPS = [
  'not_started',
  'in_progress',
  'completed',
  'paused',
] as const;
const INVESTMENT_TYPES = ['CAPEX', 'OPEX'] as const;

/**
 * Filtros da listagem de tarefas de uma intervenção.
 */
export class TaskFilterQueryDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: TASK_SITUATIONS })
  @IsOptional()
  @IsEnum(TASK_SITUATIONS)
  situation?: (typeof TASK_SITUATIONS)[number];

  @ApiPropertyOptional({ enum: TASK_URGENCIES })
  @IsOptional()
  @IsEnum(TASK_URGENCIES)
  urgency?: (typeof TASK_URGENCIES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  hasSuggestions?: boolean;

  @ApiPropertyOptional({ enum: TASK_FOLLOW_UPS })
  @IsOptional()
  @IsEnum(TASK_FOLLOW_UPS)
  followUp?: (typeof TASK_FOLLOW_UPS)[number];

  @ApiPropertyOptional({ enum: INVESTMENT_TYPES })
  @IsOptional()
  @IsEnum(INVESTMENT_TYPES)
  investmentType?: (typeof INVESTMENT_TYPES)[number];

  @ApiPropertyOptional({ description: 'Data prevista (yyyy-MM-dd).' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  predictedDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  predictedValue?: string;
}

/**
 * Query de listagem de tarefas: intervenção + paginação + filtros.
 */
export class ListTasksQueryDTO extends IntersectionType(
  BasePaginationQueryDTO,
  TaskFilterQueryDTO,
) {
  @ApiProperty({
    format: 'uuid',
    description: 'Intervenção de manutenção cujas tarefas serão listadas.',
  })
  @IsUUID()
  maintenanceId!: string;
}
