import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { UpdateCameraDTO } from './update-camera.dto';

const invalidProps = (payload: Record<string, unknown>): string[] =>
  validateSync(plainToInstance(UpdateCameraDTO, payload), {
    whitelist: true,
  }).map((e) => e.property);

describe('UpdateCameraDTO', () => {
  it('payload vazio é válido (PATCH parcial)', () => {
    expect(invalidProps({})).toEqual([]);
  });

  it('só um campo válido → sem erros', () => {
    expect(invalidProps({ name: 'Nova câmera' })).toEqual([]);
    expect(invalidProps({ enabled: false })).toEqual([]);
  });

  it('mediamtxNode inválido → erro', () => {
    expect(invalidProps({ mediamtxNode: 'bad host!' })).toContain(
      'mediamtxNode',
    );
  });

  it('mediamtxPath com barra → erro', () => {
    expect(invalidProps({ mediamtxPath: 'a/b' })).toContain('mediamtxPath');
  });
});
