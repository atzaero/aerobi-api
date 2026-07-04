import { LandingRequestStatus, type Prisma } from '@/generated/prisma/client';

/**
 * Ordenação da listagem/exportação, espelhando `sort-landing-requests.ts` do
 * `aerobi-web`:
 *
 *  - **`status=approved|rejected`**: histórico recente primeiro — `reviewedAt`
 *    (responseDate) desc, com `requestDate` desc de fallback.
 *  - **default / `status=pending`**: fila operacional — pendentes no topo (o
 *    enum é declarado `PENDING < APPROVED < REJECTED`, então `status asc` já os
 *    coloca em cima) e, dentro de cada grupo, `requestDate` asc (FIFO).
 *
 * `id` fecha como tiebreaker determinístico para a paginação.
 */
export function resolveLandingRequestOrderBy(
  status?: LandingRequestStatus,
): Prisma.LandingRequestOrderByWithRelationInput[] {
  if (
    status === LandingRequestStatus.APPROVED ||
    status === LandingRequestStatus.REJECTED
  ) {
    return [{ reviewedAt: 'desc' }, { requestDate: 'desc' }, { id: 'desc' }];
  }
  return [{ status: 'asc' }, { requestDate: 'asc' }, { id: 'asc' }];
}
