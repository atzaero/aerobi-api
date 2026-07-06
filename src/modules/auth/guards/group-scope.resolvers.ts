import type { PrismaService } from '@/prisma/prisma.service';

import { GroupScopeSubject } from './group-scope.subject';

/**
 * Resolve o `groupId` de um recurso a partir do seu `id`.
 *
 * Retorna `null` quando o recurso não existe (ou foi soft-deletado — reads
 * ativos filtram `deletedAt: null`, como em todos os repositórios) — o
 * `GroupScopeGuard` traduz isso em `404`. Recursos filhos resolvem o grupo via
 * FK (ex. `LandingRequest` → `Aerodrome.groupId`).
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
  [GroupScopeSubject.GROUP]: async (prisma, id) => {
    /**
     * O recurso é o próprio grupo: o "groupId" do escopo é o seu próprio id.
     * Retorna null se inexistente ou soft-deletado (→ 404 pelo guard).
     */
    const group = await prisma.group.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    return group?.id ?? null;
  },

  [GroupScopeSubject.AERODROME]: async (prisma, id) => {
    const aerodrome = await prisma.aerodrome.findFirst({
      where: { id, deletedAt: null },
      select: { groupId: true },
    });

    return aerodrome?.groupId ?? null;
  },

  [GroupScopeSubject.LANDING_REQUEST]: async (prisma, id) => {
    const landingRequest = await prisma.landingRequest.findFirst({
      where: { id, deletedAt: null },
      select: { aerodrome: { select: { groupId: true } } },
    });

    return landingRequest?.aerodrome.groupId ?? null;
  },

  [GroupScopeSubject.FEEDBACK]: async (prisma, id) => {
    const feedback = await prisma.feedback.findFirst({
      where: { id, deletedAt: null },
      select: { aerodrome: { select: { groupId: true } } },
    });

    return feedback?.aerodrome.groupId ?? null;
  },

  [GroupScopeSubject.CAMERA]: async (prisma, id) => {
    const camera = await prisma.camera.findFirst({
      where: { id, deletedAt: null },
      select: { aerodrome: { select: { groupId: true } } },
    });

    return camera?.aerodrome.groupId ?? null;
  },

  [GroupScopeSubject.GEOJSON]: async (prisma, id) => {
    const geojson = await prisma.geojson.findFirst({
      where: { id, deletedAt: null },
      select: { aerodrome: { select: { groupId: true } } },
    });

    return geojson?.aerodrome.groupId ?? null;
  },

  [GroupScopeSubject.MAINTENANCE]: async (prisma, id) => {
    const maintenance = await prisma.maintenance.findFirst({
      where: { id, deletedAt: null },
      select: { aerodrome: { select: { groupId: true } } },
    });

    return maintenance?.aerodrome.groupId ?? null;
  },

  [GroupScopeSubject.TASK]: async (prisma, id) => {
    const task = await prisma.maintenanceTask.findFirst({
      where: { id, deletedAt: null },
      select: {
        maintenance: { select: { aerodrome: { select: { groupId: true } } } },
      },
    });

    return task?.maintenance.aerodrome.groupId ?? null;
  },

  [GroupScopeSubject.GUESS]: async (prisma, id) => {
    const guess = await prisma.maintenanceGuess.findFirst({
      where: {
        id,
        deletedAt: null,
        task: { deletedAt: null, maintenance: { deletedAt: null } },
      },
      select: {
        task: {
          select: {
            maintenance: {
              select: { aerodrome: { select: { groupId: true } } },
            },
          },
        },
      },
    });

    return guess?.task.maintenance.aerodrome.groupId ?? null;
  },
};
