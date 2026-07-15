import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { CreateCameraDTO } from './create-camera.dto';

const base = {
  aerodromeId: '22222222-2222-4222-8222-222222222222',
  name: 'Cabeceira 06',
  mediamtxNode: 'aerobi-edge-mvp',
  mediamtxPath: 'sbxx-cam-1',
};

const invalidProps = (payload: Record<string, unknown>): string[] =>
  validateSync(plainToInstance(CreateCameraDTO, payload), {
    whitelist: true,
  }).map((e) => e.property);

describe('CreateCameraDTO', () => {
  it('payload válido não tem erros', () => {
    expect(invalidProps(base)).toEqual([]);
  });

  it('aceita node IPv4 (CGNAT tailscale) e enabled boolean', () => {
    expect(
      invalidProps({ ...base, mediamtxNode: '100.64.0.9', enabled: false }),
    ).toEqual([]);
  });

  it('name < 2 chars → erro', () => {
    expect(invalidProps({ ...base, name: 'a' })).toContain('name');
  });

  it('aerodromeId não-uuid → erro', () => {
    expect(invalidProps({ ...base, aerodromeId: 'nope' })).toContain(
      'aerodromeId',
    );
  });

  it('mediamtxNode com caracteres de autoridade (@,/) → erro (anti-SSRF)', () => {
    expect(invalidProps({ ...base, mediamtxNode: 'ev@il/host' })).toContain(
      'mediamtxNode',
    );
  });

  it('mediamtxPath com barra → erro', () => {
    expect(invalidProps({ ...base, mediamtxPath: 'a/b' })).toContain(
      'mediamtxPath',
    );
  });
});
