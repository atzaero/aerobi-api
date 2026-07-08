import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { CameraIdParamDTO } from './camera-id-param.dto';

/** `true` quando `cameraId` não tem nenhum erro de validação. */
function isValid(cameraId: unknown): boolean {
  const errors = validateSync(plainToInstance(CameraIdParamDTO, { cameraId }));
  return errors.length === 0;
}

describe('CameraIdParamDTO', () => {
  it('aceita UUID', () => {
    expect(isValid('3f2504e0-4f89-41d3-9a0c-0305e82c3301')).toBe(true);
  });

  it.each([
    /** doc id estilo Firestore (proxy legado) já não é aceito no v2 */
    'aero-mvp-cam-1',
    'not-a-uuid',
    '3f2504e0-4f89-41d3-9a0c',
    '',
    '../../etc',
  ])('rejeita cameraId não-UUID %s', (bad) => {
    expect(isValid(bad)).toBe(false);
  });
});
