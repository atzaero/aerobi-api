import { buildMovementImageKey } from './reading-image';

describe('buildMovementImageKey', () => {
  it('monta a key no layout movements/{movementId}/image/<uuid>.<ext>', () => {
    expect(buildMovementImageKey('mov-1', 'image/png')).toMatch(
      /^movements\/mov-1\/image\/[0-9a-f-]{36}\.png$/,
    );
    expect(buildMovementImageKey('m', 'image/jpeg')).toMatch(/\.jpg$/);
    expect(buildMovementImageKey('m', 'image/webp')).toMatch(/\.webp$/);
  });

  it('keys são únicas (uuid por chamada)', () => {
    expect(buildMovementImageKey('m', 'image/png')).not.toBe(
      buildMovementImageKey('m', 'image/png'),
    );
  });
});
