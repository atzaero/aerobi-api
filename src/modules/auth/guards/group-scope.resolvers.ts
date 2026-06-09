import type { PrismaService } from '@/prisma/prisma.service';

import { GroupScopeSubject } from './group-scope.subject';

/**
 * Resolve o `groupId` de um recurso a partir do seu `id`.
 *
 * Retorna `null` quando o recurso não existe — o `GroupScopeGuard` traduz isso
 * em `404`. Recursos filhos resolvem o grupo via FK (ex. `LandingRequest` →
 * `OperationalAerodrome.groupId`).
 */
export type GroupResolver = (
  prisma: PrismaService,
  id: string,
) => Promise<string | null>;

/**
 * Mapa subject → resolver. Mantido extensível: para passar a escopar um novo
 * recurso, adicione uma entrada aqui e o subject correspondente em
 * `GroupScopeSubject`. Cada resolver faz a query mínima (`select` só do
 * `groupId`) e não conhece HTTP — fica trivial de testar isoladamente.
 */
export const groupScopeResolvers: Record<GroupScopeSubject, GroupResolver> = {
  [GroupScopeSubject.OPERATIONAL_AERODROME]: async (prisma, id) => {
    const aerodrome = await prisma.operationalAerodrome.findUnique({
      where: { id },
      select: { groupId: true },
    });

    return aerodrome?.groupId ?? null;
  },

  [GroupScopeSubject.LANDING_REQUEST]: async (prisma, id) => {
    const landingRequest = await prisma.landingRequest.findUnique({
      where: { id },
      select: { operationalAerodrome: { select: { groupId: true } } },
    });

    return landingRequest?.operationalAerodrome.groupId ?? null;
  },
};
