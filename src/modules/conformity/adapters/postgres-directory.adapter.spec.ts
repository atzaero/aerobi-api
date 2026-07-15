import { LandingRequestStatus } from '@/generated/prisma/enums';
import type { PrismaService } from '@/prisma/prisma.service';

import { PostgresDirectoryAdapter } from './postgres-directory.adapter';

const HOUR_MS = 60 * 60 * 1000;

describe('PostgresDirectoryAdapter', () => {
  const reference = new Date('2026-06-09T12:00:00.000Z');

  let landingRequestFindMany: jest.Mock;
  let aerodromeFindFirst: jest.Mock;
  let userFindMany: jest.Mock;
  let adapter: PostgresDirectoryAdapter;

  beforeEach(() => {
    landingRequestFindMany = jest.fn();
    aerodromeFindFirst = jest.fn();
    userFindMany = jest.fn();
    const prisma = {
      landingRequest: { findMany: landingRequestFindMany },
      aerodrome: { findFirst: aerodromeFindFirst },
      user: { findMany: userFindMany },
    } as unknown as PrismaService;
    adapter = new PostgresDirectoryAdapter(prisma);
  });

  describe('findApprovedLandingRequestMatch', () => {
    it('retorna o match mais próximo e filtra por status/uppercase/janela/deleted', async () => {
      const near = new Date('2026-06-09T13:00:00.000Z'); // +1h
      const far = new Date('2026-06-09T15:30:00.000Z'); // +3.5h
      landingRequestFindMany.mockResolvedValue([
        {
          id: 'far',
          aircraftRegistration: 'PRABC',
          icao: 'SBSP',
          status: LandingRequestStatus.APPROVED,
          requestDate: far,
        },
        {
          id: 'near',
          aircraftRegistration: 'PRABC',
          icao: 'SBSP',
          status: LandingRequestStatus.APPROVED,
          requestDate: near,
        },
      ]);

      const result = await adapter.findApprovedLandingRequestMatch({
        registration: 'prabc',
        aerodromeIcao: 'sbsp',
        reference,
        windowHours: 4,
      });

      expect(result).toEqual({
        id: 'near',
        aircraftRegistration: 'PRABC',
        icao: 'SBSP',
        status: 'approved',
        requestDate: near,
      });
      expect(landingRequestFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: LandingRequestStatus.APPROVED,
            aircraftRegistration: 'PRABC',
            icao: 'SBSP',
            deletedAt: null,
            requestDate: {
              gte: new Date(reference.getTime() - 4 * HOUR_MS),
              lte: new Date(reference.getTime() + 4 * HOUR_MS),
            },
          },
        }),
      );
    });

    it('empate de delta: fica com a primeira linha (ordem determinística do orderBy)', async () => {
      const before = new Date('2026-06-09T11:00:00.000Z'); // -1h
      const after = new Date('2026-06-09T13:00:00.000Z'); // +1h (mesmo |delta|)
      /** O repo devolve `requestDate asc` → a mais antiga vem primeiro e vence. */
      landingRequestFindMany.mockResolvedValue([
        {
          id: 'before',
          aircraftRegistration: 'PRABC',
          icao: 'SBSP',
          status: LandingRequestStatus.APPROVED,
          requestDate: before,
        },
        {
          id: 'after',
          aircraftRegistration: 'PRABC',
          icao: 'SBSP',
          status: LandingRequestStatus.APPROVED,
          requestDate: after,
        },
      ]);

      const result = await adapter.findApprovedLandingRequestMatch({
        registration: 'PRABC',
        aerodromeIcao: 'SBSP',
        reference,
        windowHours: 4,
      });

      expect(result?.id).toBe('before');
    });

    it('retorna null quando não há match na janela', async () => {
      landingRequestFindMany.mockResolvedValue([]);
      const result = await adapter.findApprovedLandingRequestMatch({
        registration: 'PRABC',
        aerodromeIcao: 'SBSP',
        reference,
        windowHours: 2,
      });
      expect(result).toBeNull();
    });
  });

  describe('findAerodromeGroupByIcao', () => {
    it('resolve por ICAO uppercase (não eliminado)', async () => {
      aerodromeFindFirst.mockResolvedValue({
        id: 'aero-1',
        groupId: 'group-1',
      });
      const result = await adapter.findAerodromeGroupByIcao('sbsp');
      expect(result).toEqual({ aerodromeId: 'aero-1', groupId: 'group-1' });
      expect(aerodromeFindFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { icao: 'SBSP', deletedAt: null },
        }),
      );
    });

    it('retorna null quando não encontra', async () => {
      aerodromeFindFirst.mockResolvedValue(null);
      const result = await adapter.findAerodromeGroupByIcao('SBSP');
      expect(result).toBeNull();
    });
  });

  describe('findGroupContacts', () => {
    it('mapeia roles p/ enum, descarta email vazio e devolve role em minúsculas', async () => {
      userFindMany.mockResolvedValue([
        {
          email: 'coord@example.com',
          role: 'COORDINATOR',
          name: 'Coord',
          phone: '+55 11 99999-0001',
        },
        { email: '  ', role: 'OPERATOR', name: 'Sem Email', phone: null },
        { email: 'op@example.com', role: 'OPERATOR', name: '', phone: '   ' },
      ]);

      const result = await adapter.findGroupContacts('group-1', [
        'coordinator',
        'operator',
      ]);

      expect(result).toEqual([
        {
          email: 'coord@example.com',
          role: 'coordinator',
          displayName: 'Coord',
          phone: '+55 11 99999-0001',
        },
        {
          email: 'op@example.com',
          role: 'operator',
          displayName: null,
          phone: null,
        },
      ]);
      expect(userFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            groupId: 'group-1',
            role: { in: ['COORDINATOR', 'OPERATOR'] },
            deletedAt: null,
          },
        }),
      );
    });

    it('roles fora do enum → lista vazia sem consultar', async () => {
      const result = await adapter.findGroupContacts('group-1', ['bogus']);
      expect(result).toEqual([]);
      expect(userFindMany).not.toHaveBeenCalled();
    });

    it('sem contatos → lista vazia', async () => {
      userFindMany.mockResolvedValue([]);
      const result = await adapter.findGroupContacts('group-x', ['admin']);
      expect(result).toEqual([]);
    });
  });
});
