import { buildCameraFixture } from '../testing/camera.entity.fixture';

import { CameraMapper } from './camera.mapper';

describe('CameraMapper', () => {
  it('toApiRow: datas em ISO, enabled e nulls preservados', () => {
    const row = CameraMapper.toApiRow(buildCameraFixture());
    expect(row.id).toBe('11111111-1111-4111-8111-111111111111');
    expect(row.aerodromeId).toBe('22222222-2222-4222-8222-222222222222');
    expect(row.icao).toBe('SBXX');
    expect(row.enabled).toBe(true);
    expect(row.createdAt).toBe('2024-06-01T12:00:00.000Z');
    expect(row.createdBy).toBeNull();
    expect(row.deletedAt).toBeNull();
    expect(row.deletedBy).toBeNull();
  });

  it('toApiRow: deletedAt em ISO quando presente', () => {
    const row = CameraMapper.toApiRow(
      buildCameraFixture({
        deletedAt: new Date('2024-07-01T00:00:00.000Z'),
        deletedBy: 'u9',
      }),
    );
    expect(row.deletedAt).toBe('2024-07-01T00:00:00.000Z');
    expect(row.deletedBy).toBe('u9');
  });

  it('toApiRows mapeia a lista', () => {
    expect(CameraMapper.toApiRows([buildCameraFixture()])).toHaveLength(1);
  });
});
