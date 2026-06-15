import type { FirestoreService } from '@/common/firestore/firestore.service';

import { CameraRepository } from './camera.repository';

interface DocLike {
  id: string;
  exists?: boolean;
  data: Record<string, unknown> | undefined;
}

describe('CameraRepository', () => {
  let doc: jest.Mock;
  let get: jest.Mock;
  let where: jest.Mock;
  let collection: jest.Mock;
  let repository: CameraRepository;

  /** Monta um FirestoreService cujo `collection()` é encadeável. */
  const buildRepo = (): CameraRepository => {
    const db = { collection };
    const firestore = {
      getFirestore: () => db,
    } as unknown as FirestoreService;
    return new CameraRepository(firestore);
  };

  beforeEach(() => {
    doc = jest.fn();
    get = jest.fn();
    where = jest.fn();
    collection = jest.fn().mockReturnValue({ doc, where });
    repository = buildRepo();
  });

  describe('findById', () => {
    const mockDoc = (value: DocLike) => {
      doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          id: value.id,
          exists: value.exists,
          data: () => value.data,
        }),
      });
    };

    it('mapeia camelCase e normaliza icao/path', async () => {
      mockDoc({
        id: 'cam-1',
        exists: true,
        data: {
          icao: 'sbsp',
          name: 'Pátio',
          mediamtxNode: 'aerobi-edge-mvp',
          mediamtxPath: '/aero-mvp-cam-1/',
          enabled: true,
        },
      });

      const camera = await repository.findById('cam-1');

      expect(camera).toEqual({
        id: 'cam-1',
        icao: 'SBSP',
        name: 'Pátio',
        mediamtxNode: 'aerobi-edge-mvp',
        mediamtxPath: 'aero-mvp-cam-1',
        enabled: true,
      });
    });

    it('aceita snake_case (mediamtx_node/mediamtx_path)', async () => {
      mockDoc({
        id: 'cam-2',
        exists: true,
        data: {
          icao: 'SBSP',
          name: 'Cabeceira',
          mediamtx_node: 'aerobi-edge-mvp',
          mediamtx_path: 'aero-mvp-cam-2',
          enabled: false,
        },
      });

      const camera = await repository.findById('cam-2');

      expect(camera?.mediamtxNode).toBe('aerobi-edge-mvp');
      expect(camera?.mediamtxPath).toBe('aero-mvp-cam-2');
      expect(camera?.enabled).toBe(false);
    });

    it('devolve null quando o doc não existe', async () => {
      mockDoc({ id: 'x', exists: false, data: undefined });
      expect(await repository.findById('x')).toBeNull();
    });

    it('devolve null quando soft-deletado', async () => {
      mockDoc({
        id: 'cam-1',
        exists: true,
        data: {
          icao: 'SBSP',
          mediamtxNode: 'n',
          mediamtxPath: 'p',
          enabled: true,
          deleted_at: new Date(),
        },
      });
      expect(await repository.findById('cam-1')).toBeNull();
    });

    it('devolve null quando faltam campos obrigatórios', async () => {
      mockDoc({
        id: 'cam-1',
        exists: true,
        data: { name: 'Sem node', enabled: true },
      });
      expect(await repository.findById('cam-1')).toBeNull();
    });

    it('devolve null quando mediamtxNode tem caracteres inválidos (anti-SSRF)', async () => {
      mockDoc({
        id: 'cam-1',
        exists: true,
        data: {
          icao: 'SBSP',
          mediamtxNode: 'evil.com/@internal:9999',
          mediamtxPath: 'aero-mvp-cam-1',
          enabled: true,
        },
      });
      expect(await repository.findById('cam-1')).toBeNull();
    });

    it('devolve null quando mediamtxPath tenta path traversal (..)', async () => {
      mockDoc({
        id: 'cam-1',
        exists: true,
        data: {
          icao: 'SBSP',
          mediamtxNode: 'aerobi-edge-mvp',
          mediamtxPath: 'a/../../secret',
          enabled: true,
        },
      });
      expect(await repository.findById('cam-1')).toBeNull();
    });

    it('aceita mediamtxPath com sub-paths válidos', async () => {
      mockDoc({
        id: 'cam-1',
        exists: true,
        data: {
          icao: 'SBSP',
          mediamtxNode: '100.64.0.9',
          mediamtxPath: 'aero/cam-1',
          enabled: true,
        },
      });
      const camera = await repository.findById('cam-1');
      expect(camera?.mediamtxNode).toBe('100.64.0.9');
      expect(camera?.mediamtxPath).toBe('aero/cam-1');
    });
  });

  describe('findEnabledByIcao', () => {
    const mockQuery = (docs: DocLike[]) => {
      where.mockReturnValue({
        get: get.mockResolvedValue({
          docs: docs.map((d) => ({ id: d.id, data: () => d.data })),
        }),
      });
    };

    it('filtra desabilitadas e soft-deletadas, ordena por nome', async () => {
      mockQuery([
        {
          id: 'b',
          data: {
            icao: 'SBSP',
            name: 'Bravo',
            mediamtxNode: 'n',
            mediamtxPath: 'b',
            enabled: true,
          },
        },
        {
          id: 'a',
          data: {
            icao: 'SBSP',
            name: 'Alfa',
            mediamtxNode: 'n',
            mediamtxPath: 'a',
            enabled: true,
          },
        },
        {
          id: 'off',
          data: {
            icao: 'SBSP',
            name: 'Desligada',
            mediamtxNode: 'n',
            mediamtxPath: 'o',
            enabled: false,
          },
        },
        {
          id: 'del',
          data: {
            icao: 'SBSP',
            name: 'Removida',
            mediamtxNode: 'n',
            mediamtxPath: 'd',
            enabled: true,
            deletedAt: new Date(),
          },
        },
      ]);

      const cameras = await repository.findEnabledByIcao('sbsp');

      expect(where).toHaveBeenCalledWith('icao', '==', 'SBSP');
      expect(cameras.map((c) => c.name)).toEqual(['Alfa', 'Bravo']);
    });

    it('devolve lista vazia quando não há câmeras', async () => {
      mockQuery([]);
      expect(await repository.findEnabledByIcao('SBSP')).toEqual([]);
    });
  });
});
