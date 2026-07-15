import {
  buildCameraCreateInput,
  patchCameraToPrisma,
} from './camera.prisma.mapper';

describe('buildCameraCreateInput', () => {
  it('conecta o aeródromo e mantém icao/enabled/createdBy', () => {
    expect(
      buildCameraCreateInput({
        aerodromeId: 'aid',
        icao: 'SBXX',
        name: 'Cam',
        mediamtxNode: 'node',
        mediamtxPath: 'path',
        enabled: true,
        createdBy: 'u1',
      }),
    ).toEqual({
      aerodrome: { connect: { id: 'aid' } },
      icao: 'SBXX',
      name: 'Cam',
      mediamtxNode: 'node',
      mediamtxPath: 'path',
      enabled: true,
      createdBy: 'u1',
    });
  });
});

describe('patchCameraToPrisma', () => {
  it('campos ausentes viram no-op (undefined); updatedBy sempre setado', () => {
    expect(patchCameraToPrisma({}, 'u2')).toEqual({
      name: undefined,
      mediamtxNode: undefined,
      mediamtxPath: undefined,
      enabled: undefined,
      updatedBy: 'u2',
    });
  });

  it('só os campos enviados são setados', () => {
    expect(patchCameraToPrisma({ name: 'Novo', enabled: false }, 'u2')).toEqual(
      {
        name: 'Novo',
        mediamtxNode: undefined,
        mediamtxPath: undefined,
        enabled: false,
        updatedBy: 'u2',
      },
    );
  });
});
