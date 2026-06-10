import type { FirestoreService } from '@/common/firestore/firestore.service';

import { FirestoreDirectoryAdapter } from './firestore-directory.adapter';

/** Fake de um QueryDocumentSnapshot do Firestore. */
function fakeDoc(id: string, data: Record<string, unknown>) {
  return { id, data: () => data };
}

/** Timestamp Firestore minimalista (`.toDate()`). */
function ts(date: Date) {
  return { toDate: () => date };
}

/**
 * Constrói um mock encadeável de Firestore. Cada chamada a
 * `collection(name)` devolve uma query cujo `.where()` retorna a própria query
 * e cujo `.get()` resolve para os docs configurados para essa coleção.
 */
function buildFirestoreMock(docsByCollection: Record<string, unknown[]>) {
  const whereCalls: Record<string, unknown[][]> = {};

  const collection = jest.fn((name: string) => {
    whereCalls[name] = whereCalls[name] ?? [];
    const query: Record<string, unknown> = {};
    query.where = jest.fn((...args: unknown[]) => {
      whereCalls[name].push(args);
      return query;
    });
    query.get = jest.fn(() =>
      Promise.resolve({ docs: docsByCollection[name] ?? [] }),
    );
    return query;
  });

  const firestore = { collection } as unknown;
  const service = {
    getFirestore: () => firestore,
  } as unknown as FirestoreService;

  return { service, collection, whereCalls };
}

describe('FirestoreDirectoryAdapter', () => {
  const reference = new Date('2026-06-09T12:00:00.000Z');

  describe('findApprovedLandingRequestMatch', () => {
    it('retorna o match mais próximo dentro da janela', async () => {
      const near = new Date('2026-06-09T13:00:00.000Z'); // +1h
      const far = new Date('2026-06-09T15:30:00.000Z'); // +3.5h (fora p/ 2h? não, dentro de 4h)
      const docs = [
        fakeDoc('far', {
          aircraft_registration: 'PRABC',
          icao: 'SBSP',
          status: 'approved',
          request_date: ts(far),
        }),
        fakeDoc('near', {
          aircraft_registration: 'PRABC',
          icao: 'SBSP',
          status: 'approved',
          request_date: ts(near),
        }),
      ];
      const { service, collection, whereCalls } = buildFirestoreMock({
        landing_requests: docs,
      });
      const adapter = new FirestoreDirectoryAdapter(service);

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
      expect(collection).toHaveBeenCalledWith('landing_requests');
      // matrícula e icao normalizados para uppercase + filtro de status approved
      expect(whereCalls.landing_requests).toEqual([
        ['aircraft_registration', '==', 'PRABC'],
        ['icao', '==', 'SBSP'],
        ['status', '==', 'approved'],
      ]);
    });

    it('retorna null quando todos os docs estão fora da janela', async () => {
      const outside = new Date('2026-06-09T20:00:00.000Z'); // +8h
      const { service } = buildFirestoreMock({
        landing_requests: [
          fakeDoc('out', {
            aircraft_registration: 'PRABC',
            icao: 'SBSP',
            status: 'approved',
            request_date: ts(outside),
          }),
        ],
      });
      const adapter = new FirestoreDirectoryAdapter(service);

      const result = await adapter.findApprovedLandingRequestMatch({
        registration: 'PRABC',
        aerodromeIcao: 'SBSP',
        reference,
        windowHours: 2,
      });

      expect(result).toBeNull();
    });

    it('descarta docs com deleted_at != null', async () => {
      const near = new Date('2026-06-09T12:30:00.000Z');
      const { service } = buildFirestoreMock({
        landing_requests: [
          fakeDoc('deleted', {
            aircraft_registration: 'PRABC',
            icao: 'SBSP',
            status: 'approved',
            request_date: ts(near),
            deleted_at: ts(near),
          }),
        ],
      });
      const adapter = new FirestoreDirectoryAdapter(service);

      const result = await adapter.findApprovedLandingRequestMatch({
        registration: 'PRABC',
        aerodromeIcao: 'SBSP',
        reference,
        windowHours: 4,
      });

      expect(result).toBeNull();
    });

    it('retorna null quando não há docs', async () => {
      const { service } = buildFirestoreMock({ landing_requests: [] });
      const adapter = new FirestoreDirectoryAdapter(service);

      const result = await adapter.findApprovedLandingRequestMatch({
        registration: 'PRABC',
        aerodromeIcao: 'SBSP',
        reference,
        windowHours: 4,
      });

      expect(result).toBeNull();
    });
  });

  describe('findAerodromeGroupByIcao', () => {
    it('retorna o primeiro aeródromo não eliminado por ICAO', async () => {
      const { service, whereCalls } = buildFirestoreMock({
        aerodromes: [fakeDoc('aero-1', { icao: 'SBSP', group_id: 'group-1' })],
      });
      const adapter = new FirestoreDirectoryAdapter(service);

      const result = await adapter.findAerodromeGroupByIcao('sbsp');

      expect(result).toEqual({ aerodromeId: 'aero-1', groupId: 'group-1' });
      expect(whereCalls.aerodromes).toEqual([['icao', '==', 'SBSP']]);
    });

    it('ignora aeródromos com deleted_at e retorna null se nenhum válido', async () => {
      const { service } = buildFirestoreMock({
        aerodromes: [
          fakeDoc('aero-del', {
            icao: 'SBSP',
            group_id: 'group-1',
            deleted_at: ts(reference),
          }),
        ],
      });
      const adapter = new FirestoreDirectoryAdapter(service);

      const result = await adapter.findAerodromeGroupByIcao('SBSP');

      expect(result).toBeNull();
    });
  });

  describe('findGroupContacts', () => {
    it('filtra por grupo+roles e descarta deleted/sem email', async () => {
      const { service, whereCalls } = buildFirestoreMock({
        users: [
          fakeDoc('u1', {
            aerodrome_group_id: 'group-1',
            role: 'coordinator',
            email: 'coord@example.com',
            display_name: 'Coord',
          }),
          fakeDoc('u2', {
            aerodrome_group_id: 'group-1',
            role: 'operator',
            email: '',
            display_name: 'Sem Email',
          }),
          fakeDoc('u3', {
            aerodrome_group_id: 'group-1',
            role: 'operator',
            email: 'deleted@example.com',
            display_name: 'Deleted',
            deleted_at: ts(reference),
          }),
          fakeDoc('u4', {
            aerodrome_group_id: 'group-1',
            role: 'operator',
            email: 'op@example.com',
          }),
        ],
      });
      const adapter = new FirestoreDirectoryAdapter(service);

      const result = await adapter.findGroupContacts('group-1', [
        'coordinator',
        'operator',
      ]);

      expect(result).toEqual([
        {
          email: 'coord@example.com',
          role: 'coordinator',
          displayName: 'Coord',
        },
        { email: 'op@example.com', role: 'operator', displayName: null },
      ]);
      expect(whereCalls.users).toEqual([
        ['aerodrome_group_id', '==', 'group-1'],
        ['role', 'in', ['coordinator', 'operator']],
      ]);
    });

    it('retorna lista vazia quando não há contatos', async () => {
      const { service } = buildFirestoreMock({ users: [] });
      const adapter = new FirestoreDirectoryAdapter(service);

      const result = await adapter.findGroupContacts('group-x', ['admin']);

      expect(result).toEqual([]);
    });
  });
});
