import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

const TASK_STATUSES = ['pending', 'completed'] as const;
const TASK_URGENCIES = ['low', 'medium', 'high', 'critical'] as const;
const TASK_FOLLOW_UPS = [
  'not_started',
  'in_progress',
  'completed',
  'paused',
] as const;
const INVESTMENT_TYPES = ['CAPEX', 'OPEX'] as const;

/**
 * Campos compartilhados de formulário de tarefa (create/update).
 */
export class TaskFormFieldsDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  predictedValue!: number;

  @ApiProperty({ format: 'date-time' })
  @IsISO8601()
  insertionDate!: string;

  @ApiProperty({ format: 'date-time' })
  @IsISO8601()
  predictedDate!: string;

  @ApiPropertyOptional({ enum: TASK_STATUSES, default: 'pending' })
  @IsOptional()
  @IsEnum(TASK_STATUSES)
  status?: (typeof TASK_STATUSES)[number];

  @ApiPropertyOptional({ enum: TASK_URGENCIES })
  @IsOptional()
  @IsEnum(TASK_URGENCIES)
  urgency?: (typeof TASK_URGENCIES)[number];

  @ApiPropertyOptional({ enum: TASK_FOLLOW_UPS })
  @IsOptional()
  @IsEnum(TASK_FOLLOW_UPS)
  followUp?: (typeof TASK_FOLLOW_UPS)[number];

  @ApiPropertyOptional({ enum: INVESTMENT_TYPES })
  @IsOptional()
  @IsEnum(INVESTMENT_TYPES)
  investmentType?: (typeof INVESTMENT_TYPES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  responsibility?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  impact?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsISO8601()
  completionDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  actualCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  completionDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  timeElapsed?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  delayWarning?: boolean;
}

/**
 * Body para POST /tasks.
 */
export class CreateTaskDTO extends TaskFormFieldsDTO {
  @ApiProperty({
    format: 'uuid',
    description: 'Intervenção de manutenção dona da tarefa.',
  })
  @IsUUID()
  maintenanceId!: string;
}

/**
 * Body para PATCH /tasks/:id.
 */
export class UpdateTaskDTO extends TaskFormFieldsDTO {}

/**
 * Resposta de tarefa (listagem e detalhe).
 */
export class TaskResponseDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  maintenanceId!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  predictedValue!: number;

  @ApiProperty({ format: 'date-time' })
  insertionDate!: string;

  @ApiProperty({ format: 'date-time' })
  predictedDate!: string;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  completionDate!: string | null;

  @ApiPropertyOptional({ nullable: true })
  actualCost!: number | null;

  @ApiPropertyOptional({ nullable: true })
  completionDescription!: string | null;

  @ApiPropertyOptional({ nullable: true })
  impact!: string | null;

  @ApiPropertyOptional({ nullable: true })
  timeElapsed!: string | null;

  @ApiProperty({ enum: TASK_STATUSES })
  status!: (typeof TASK_STATUSES)[number];

  @ApiPropertyOptional({ enum: TASK_URGENCIES, nullable: true })
  urgency!: (typeof TASK_URGENCIES)[number] | null;

  @ApiPropertyOptional({ enum: TASK_FOLLOW_UPS, nullable: true })
  followUp!: (typeof TASK_FOLLOW_UPS)[number] | null;

  @ApiPropertyOptional({ enum: INVESTMENT_TYPES, nullable: true })
  investmentType!: (typeof INVESTMENT_TYPES)[number] | null;

  @ApiPropertyOptional({ nullable: true })
  responsibility!: string | null;

  @ApiPropertyOptional({ nullable: true })
  delayWarning!: boolean | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;

  @ApiPropertyOptional()
  suggestionCount?: number;
}

/**
 * Resposta mínima da criação de tarefa.
 */
export class CreateTaskResponseDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  maintenanceId!: string;
}

/**
 * Resposta do soft-delete de tarefa.
 */
export class TaskDeletionResponseDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;
}
