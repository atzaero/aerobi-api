import {
  InvestmentType,
  TaskFollowUp,
  TaskStatus,
  TaskUrgency,
  type MaintenanceTask,
  type Prisma,
} from '@/generated/prisma/client';

import { CreateTaskDTO, UpdateTaskDTO } from '../dtos/task.dto';
import { computeTaskDelayWarning } from '@/modules/maintenances/utils/maintenance-domain.util';

/** Converte enum Prisma de status para API (lowercase). */
export function taskStatusToApi(status: TaskStatus): 'pending' | 'completed' {
  return status === TaskStatus.COMPLETED ? 'completed' : 'pending';
}

export function taskStatusFromApi(status: 'pending' | 'completed'): TaskStatus {
  return status === 'completed' ? TaskStatus.COMPLETED : TaskStatus.PENDING;
}

export function taskUrgencyToApi(
  urgency: TaskUrgency | null,
): 'low' | 'medium' | 'high' | 'critical' | null {
  if (urgency == null) return null;
  return urgency.toLowerCase() as 'low' | 'medium' | 'high' | 'critical';
}

export function taskUrgencyFromApi(
  urgency?: 'low' | 'medium' | 'high' | 'critical',
): TaskUrgency | undefined {
  if (urgency == null) return undefined;
  return urgency.toUpperCase() as TaskUrgency;
}

export function taskFollowUpToApi(
  followUp: TaskFollowUp | null,
): 'not_started' | 'in_progress' | 'completed' | 'paused' | null {
  if (followUp == null) return null;
  return followUp.toLowerCase() as
    | 'not_started'
    | 'in_progress'
    | 'completed'
    | 'paused';
}

export function taskFollowUpFromApi(
  followUp?: 'not_started' | 'in_progress' | 'completed' | 'paused',
): TaskFollowUp | undefined {
  if (followUp == null) return undefined;
  return followUp.toUpperCase() as TaskFollowUp;
}

export function investmentTypeToApi(
  value: InvestmentType | null,
): 'CAPEX' | 'OPEX' | null {
  return value;
}

export function investmentTypeFromApi(
  value?: 'CAPEX' | 'OPEX',
): InvestmentType | undefined {
  return value;
}

/**
 * Normaliza uma string opcional para persistência: trima e converte string
 * vazia/whitespace (ou ausente) em `null`. Espelha o `optionalTrimmed → orNull`
 * do `aerobi-web`, evitando gravar `''` onde o contrato espera `null`.
 */
function trimToNull(value?: string | null): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseIsoDate(value: string): Date {
  return new Date(value);
}

function optionalIsoDate(value?: string): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return parseIsoDate(value);
}

function buildTaskScalarFields(
  dto: CreateTaskDTO | UpdateTaskDTO,
): Omit<
  Prisma.MaintenanceTaskCreateInput,
  'maintenance' | 'createdBy' | 'updatedBy'
> {
  const status = taskStatusFromApi(dto.status ?? 'pending');
  const predictedDate = parseIsoDate(dto.predictedDate);
  const insertionDate = parseIsoDate(dto.insertionDate);
  const completionDate = optionalIsoDate(dto.completionDate);

  const delayWarning =
    dto.delayWarning ??
    computeTaskDelayWarning(
      predictedDate.getTime(),
      completionDate?.getTime(),
      status,
    );

  return {
    title: dto.title.trim(),
    description: dto.description.trim(),
    predictedValue: dto.predictedValue,
    insertionDate,
    predictedDate,
    completionDate: completionDate ?? null,
    actualCost: dto.actualCost ?? null,
    completionDescription: trimToNull(dto.completionDescription),
    impact: trimToNull(dto.impact),
    timeElapsed: trimToNull(dto.timeElapsed),
    status,
    urgency: taskUrgencyFromApi(dto.urgency) ?? null,
    followUp: taskFollowUpFromApi(dto.followUp) ?? null,
    investmentType: investmentTypeFromApi(dto.investmentType) ?? null,
    responsibility: trimToNull(dto.responsibility),
    delayWarning: delayWarning ?? null,
  };
}

export function buildTaskCreateInput(params: {
  dto: CreateTaskDTO;
  maintenanceId: string;
  actorId: string;
}): Prisma.MaintenanceTaskCreateInput {
  return {
    ...buildTaskScalarFields(params.dto),
    maintenance: { connect: { id: params.maintenanceId } },
    createdBy: params.actorId,
    updatedBy: params.actorId,
  };
}

export function buildTaskUpdateInput(params: {
  dto: UpdateTaskDTO;
  actorId: string;
}): Prisma.MaintenanceTaskUpdateInput {
  return {
    ...buildTaskScalarFields(params.dto),
    updatedBy: params.actorId,
  };
}

export function decimalToApiNumber(
  value: MaintenanceTask['predictedValue'] | MaintenanceTask['actualCost'],
): number | null {
  if (value == null) return null;
  const n = value.toNumber();
  return Number.isFinite(n) ? n : null;
}
