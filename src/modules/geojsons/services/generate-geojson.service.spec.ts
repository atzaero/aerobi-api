import { AuditAction, GeojsonMapFileType } from '@/generated/prisma/client';
import type { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';

import type { GeojsonRepository } from '../repositories/geojson.repository';
import { buildGeojsonFixture } from '../testing/geojson.entity.fixture';

import { GenerateGeojsonService } from './generate-geojson.service';

const aerodromeId = '22222222-2222-4222-8222-222222222222';
const actorId = 'admin-1';

const KML =
  '<?xml version="1.0"?><kml xmlns="http://www.opengis.net/kml/2.2">' +
  '<Document><Placemark><name>P1</name><Point>' +
  '<coordinates>-46.6,-23.5,0</coordinates></Point></Placemark></Document></kml>';

/** Buffer com magic-number de ZIP mas conteúdo inválido → JSZip lança → ERROR. */
const INVALID_ZIP = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x01]);

describe('GenerateGeojsonService', () => {
  let service: GenerateGeojsonService;
  let aerodromeExists: jest.Mock;
  let findByAerodromeIdAnyState: jest.Mock;
  let upsertByAerodromeId: jest.Mock;
  let record: jest.Mock;

  beforeEach(() => {
    aerodromeExists = jest.fn().mockResolvedValue(true);
    findByAerodromeIdAnyState = jest.fn().mockResolvedValue(null);
    upsertByAerodromeId = jest
      .fn()
      .mockResolvedValue(buildGeojsonFixture({ aerodromeId }));
    record = jest.fn().mockResolvedValue(undefined);
    service = new GenerateGeojsonService(
      {
        aerodromeExists,
        findByAerodromeIdAnyState,
        upsertByAerodromeId,
      } as unknown as GeojsonRepository,
      { record } as unknown as AuditRecorderService,
    );
  });

  it('aeródromo inexistente → SKIPPED, sem upsert nem auditoria', async () => {
    aerodromeExists.mockResolvedValue(false);
    const out = await service.execute({
      aerodromeId,
      fileType: GeojsonMapFileType.KML,
      buffer: Buffer.from(KML),
      actorId,
    });
    expect(out).toEqual({ status: 'SKIPPED', geojson: null });
    expect(upsertByAerodromeId).not.toHaveBeenCalled();
    expect(record).not.toHaveBeenCalled();
  });

  it('KML válido novo → READY + upsert + auditoria CREATE', async () => {
    const out = await service.execute({
      aerodromeId,
      fileType: GeojsonMapFileType.KML,
      buffer: Buffer.from(KML),
      actorId,
    });
    expect(out.status).toBe('READY');
    expect(upsertByAerodromeId).toHaveBeenCalledWith(
      aerodromeId,
      expect.objectContaining({ createdBy: actorId, updatedBy: actorId }),
      expect.objectContaining({ deletedAt: null, deletedBy: null }),
    );
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.CREATE,
        entityType: 'geojson',
      }),
      expect.anything(),
    );
  });

  it('registro existente (soft-deletado) → auditoria UPDATE (re-ativação)', async () => {
    findByAerodromeIdAnyState.mockResolvedValue(
      buildGeojsonFixture({ aerodromeId, deletedAt: new Date() }),
    );
    await service.execute({
      aerodromeId,
      fileType: GeojsonMapFileType.KML,
      buffer: Buffer.from(KML),
      actorId,
    });
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({ action: AuditAction.UPDATE }),
      expect.anything(),
    );
  });

  it('conversão falha (ZIP inválido) → ERROR best-effort (não lança)', async () => {
    const out = await service.execute({
      aerodromeId,
      fileType: GeojsonMapFileType.KMZ,
      buffer: INVALID_ZIP,
      actorId,
    });
    expect(out.status).toBe('ERROR');
    expect(upsertByAerodromeId).toHaveBeenCalled();
    expect(record).toHaveBeenCalled();
  });
});
