import { TaskStatus } from '@/generated/prisma/client';

/**
 * Intervenção com acesso público ativo: exige e-mails autorizados **e** código de
 * segurança. Sem e-mails cadastrados a intervenção é privada.
 */
export function isMaintenancePublicAccess(maintenance: {
  authorizedEmails: readonly string[];
  securityCode: string | null;
}): boolean {
  return (
    maintenance.authorizedEmails.length > 0 &&
    (maintenance.securityCode?.trim().length ?? 0) > 0
  );
}

/** Nome de exibição da intervenção; legado sem `name` usa fallback. */
export function formatMaintenanceDisplayName(name: string): string {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : 'Intervenção sem nome';
}

/** Normaliza timestamp para início do dia civil local (ms). */
function startOfDayMs(timestampMs: number): number {
  const d = new Date(timestampMs);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * `true` quando a conclusão ocorreu após a data prevista (comparação por dia
 * civil).
 */
export function isTaskCompletedWithDelay(
  predictedDateMs: number,
  completionDateMs: number,
): boolean {
  return startOfDayMs(completionDateMs) > startOfDayMs(predictedDateMs);
}

/**
 * Calcula `delayWarning` ao salvar uma tarefa concluída. Usa `completionDateMs`
 * ou a data atual quando a conclusão não foi informada.
 */
export function computeTaskDelayWarning(
  predictedDateMs: number,
  completionDateMs: number | undefined,
  status: TaskStatus,
): boolean | undefined {
  if (status !== TaskStatus.COMPLETED) return undefined;
  const completion = completionDateMs ?? Date.now();
  return isTaskCompletedWithDelay(predictedDateMs, completion);
}

/**
 * Tarefa pendente cuja data prevista já passou (dia civil).
 */
export function isTaskCurrentlyOverdue(
  task: { status: TaskStatus; predictedDate: Date | null },
  nowMs: number = Date.now(),
): boolean {
  if (task.status !== TaskStatus.PENDING || task.predictedDate == null) {
    return false;
  }
  return startOfDayMs(nowMs) > startOfDayMs(task.predictedDate.getTime());
}

/** Tarefa concluída com flag de atraso persistida. */
export function isTaskDeliveredLate(task: {
  status: TaskStatus;
  delayWarning: boolean | null;
}): boolean {
  return task.status === TaskStatus.COMPLETED && task.delayWarning === true;
}
