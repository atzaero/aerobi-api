import type { UserGroupScope } from '@/common/utils/group-scope.util';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import type { ErrorMessageService } from '@/common/error-messages/error-message.service';
import type { Prisma } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

export type AerodromeForVisitScope = Prisma.AerodromeGetPayload<{
  include: { group: { select: { uf: true } } };
}>;

/**
 * Garante que o aeródromo existe e pertence ao escopo operacional do ator.
 * Fora do escopo ⇒ 404 (não vaza existência), espelhando `assertAerodromeOperationalAccess`.
 */
export async function assertAerodromeOperationalScope(
  prisma: PrismaService,
  errorMessageService: ErrorMessageService,
  aerodromeId: string,
  scope: UserGroupScope,
): Promise<AerodromeForVisitScope> {
  const aerodrome = await prisma.aerodrome.findFirst({
    where: { id: aerodromeId, deletedAt: null },
    include: { group: { select: { uf: true } } },
  });

  if (!aerodrome) {
    throw resourceNotFound(errorMessageService, 'Aeródromo', aerodromeId);
  }

  const outOfScope =
    scope.kind === 'none' ||
    (scope.kind === 'group' && aerodrome.groupId !== scope.groupId);
  if (outOfScope) {
    throw resourceNotFound(errorMessageService, 'Aeródromo', aerodromeId);
  }

  return aerodrome;
}
