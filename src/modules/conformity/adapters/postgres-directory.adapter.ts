import { Injectable } from '@nestjs/common';

import { LandingRequestStatus, UserRole } from '@/generated/prisma/enums';
import { PrismaService } from '@/prisma/prisma.service';

import type {
  AerodromeGroup,
  DirectoryPort,
  FindApprovedLandingRequestMatchInput,
  GroupContact,
  LandingRequestMatch,
} from '../ports/directory.port';

/** Valores válidos do enum `UserRole` (para mapear as roles de entrada). */
const USER_ROLE_VALUES = new Set<string>(Object.values(UserRole));

/**
 * Adapter **Postgres** do {@link DirectoryPort} (#475) — substitui o antigo
 * `FirestoreDirectoryAdapter` lendo as mesmas 3 fontes já migradas para o
 * Postgres (`landing_requests` #377, `aerodromes` #368, `users`/`groups` #371).
 * É o **único** ponto que conhece models/colunas Prisma; o port e os listeners
 * ficam intactos. Preserva a semântica do adapter Firestore (janela ±windowHours,
 * match mais próximo de `reference`, normalização uppercase de matrícula/ICAO,
 * descarte de eliminados e de e-mails vazios).
 */
@Injectable()
export class PostgresDirectoryAdapter implements DirectoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findApprovedLandingRequestMatch(
    input: FindApprovedLandingRequestMatchInput,
  ): Promise<LandingRequestMatch | null> {
    const { registration, aerodromeIcao, reference, windowHours } = input;
    const windowMs = windowHours * 60 * 60 * 1000;
    const referenceMs = reference.getTime();

    /**
     * A janela ±`windowHours` entra no `where` (inclusiva nas duas pontas), então
     * todas as linhas retornadas já estão dentro dela; resta escolher a mais
     * próxima de `reference` (o Prisma não ordena por `abs(delta)`). `orderBy`
     * torna o desempate determinístico (a mais antiga vence, com `id` de reforço).
     */
    const rows = await this.prisma.landingRequest.findMany({
      where: {
        status: LandingRequestStatus.APPROVED,
        aircraftRegistration: registration.toUpperCase(),
        icao: aerodromeIcao.toUpperCase(),
        deletedAt: null,
        requestDate: {
          gte: new Date(referenceMs - windowMs),
          lte: new Date(referenceMs + windowMs),
        },
      },
      select: {
        id: true,
        aircraftRegistration: true,
        icao: true,
        status: true,
        requestDate: true,
      },
      orderBy: [{ requestDate: 'asc' }, { id: 'asc' }],
    });

    let best: LandingRequestMatch | null = null;
    let bestDelta = Number.POSITIVE_INFINITY;
    for (const row of rows) {
      const delta = Math.abs(row.requestDate.getTime() - referenceMs);
      if (delta < bestDelta) {
        bestDelta = delta;
        best = {
          id: row.id,
          aircraftRegistration: row.aircraftRegistration ?? '',
          icao: row.icao ?? '',
          /** Minúsculo para paridade estrita com o adapter Firestore removido. */
          status: row.status.toLowerCase(),
          requestDate: row.requestDate,
        };
      }
    }

    return best;
  }

  async findAerodromeGroupByIcao(icao: string): Promise<AerodromeGroup | null> {
    const row = await this.prisma.aerodrome.findFirst({
      where: { icao: icao.toUpperCase(), deletedAt: null },
      select: { id: true, groupId: true },
      /** Determinístico se houver ICAO ativo repetido entre grupos distintos. */
      orderBy: { id: 'asc' },
    });
    if (!row) {
      return null;
    }
    return { aerodromeId: row.id, groupId: row.groupId };
  }

  async findGroupContacts(
    groupId: string,
    roles: string[],
  ): Promise<GroupContact[]> {
    /**
     * As roles chegam em minúsculas (`'coordinator'`/`'operator'`); o enum
     * Postgres é maiúsculo. Mapeia e descarta valores fora do enum — sem roles
     * válidas, não há contactos.
     */
    const mappedRoles = roles
      .map((role) => role.toUpperCase())
      .filter((role): role is UserRole => USER_ROLE_VALUES.has(role));
    if (mappedRoles.length === 0) {
      return [];
    }

    const users = await this.prisma.user.findMany({
      where: { groupId, role: { in: mappedRoles }, deletedAt: null },
      select: { email: true, role: true, name: true, phone: true },
    });

    const contacts: GroupContact[] = [];
    for (const user of users) {
      const email = user.email.trim();
      if (!email) {
        continue;
      }
      const phone = user.phone?.trim();
      contacts.push({
        email,
        role: user.role.toLowerCase(),
        displayName: user.name.length > 0 ? user.name : null,
        phone: phone && phone.length > 0 ? phone : null,
      });
    }

    return contacts;
  }
}
