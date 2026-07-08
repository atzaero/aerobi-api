import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { StreamSegmentParamDTO } from './stream-segment-param.dto';

/** `true` quando a propriedade indicada não tem nenhum erro de validação. */
function isPropValid(
  payload: Record<string, unknown>,
  prop: keyof StreamSegmentParamDTO,
): boolean {
  const errors = validateSync(plainToInstance(StreamSegmentParamDTO, payload));
  return !errors.some((e) => e.property === prop);
}

describe('StreamSegmentParamDTO', () => {
  const cameraId = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';

  describe('segment', () => {
    it.each([
      'seg7.m4s',
      'init.mp4',
      'c5ad5d39d3c1_video1_seg16.mp4',
      'c5ad5d39d3c1_video1_init.mp4',
      'video1_stream.m3u8',
      'video1_stream_1080p.m3u8',
    ])('aceita segmento/variante válido %s', (segment) => {
      expect(isPropValid({ cameraId, segment }, 'segment')).toBe(true);
    });

    it.each([
      '../etc/passwd',
      'foo/bar.m4s',
      'video1_stream.m3u8.bak',
      'playlist.txt',
      'index.html',
      'noextension',
      '',
    ])('rejeita segmento inválido %s', (segment) => {
      expect(isPropValid({ cameraId, segment }, 'segment')).toBe(false);
    });
  });

  describe('cameraId', () => {
    it('aceita UUID', () => {
      expect(isPropValid({ cameraId, segment: 'seg7.m4s' }, 'cameraId')).toBe(
        true,
      );
    });

    it.each(['aero-mvp-cam-1', 'cam/../1', 'not-a-uuid', ''])(
      'rejeita cameraId não-UUID %s',
      (bad) => {
        expect(
          isPropValid({ cameraId: bad, segment: 'seg7.m4s' }, 'cameraId'),
        ).toBe(false);
      },
    );
  });
});
