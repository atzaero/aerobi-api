import type { MaintenanceGuess } from '@/generated/prisma/client';

/**
 * Recorte estável de um palpite para os snapshots `before`/`after` da auditoria.
 * Projeta só campos identificadores/estado (`id`, `status`) — nunca a PII do
 * palpiteiro (`email`) nem o conteúdo (`text`) na trilha append-only.
 */
export function guessAuditSnapshot(
  guess: Pick<MaintenanceGuess, 'id' | 'status'>,
): { id: string; status: MaintenanceGuess['status'] } {
  return { id: guess.id, status: guess.status };
}
