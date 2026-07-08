import { buildGroupImageKey, MAX_GROUP_IMAGE_SIZE_BYTES } from './group-image';

describe('group-image utils', () => {
  it('limite de 5 MB', () => {
    expect(MAX_GROUP_IMAGE_SIZE_BYTES).toBe(5 * 1024 * 1024);
  });

  it('monta a key no layout groups/{groupId}/images/<uuid>.<ext>', () => {
    expect(buildGroupImageKey('grp-1', 'image/png')).toMatch(
      /^groups\/grp-1\/images\/[0-9a-f-]{36}\.png$/,
    );
    expect(buildGroupImageKey('g', 'image/jpeg')).toMatch(/\.jpg$/);
    expect(buildGroupImageKey('g', 'image/webp')).toMatch(/\.webp$/);
  });

  it('keys são únicas (uuid por chamada)', () => {
    const a = buildGroupImageKey('g', 'image/png');
    const b = buildGroupImageKey('g', 'image/png');
    expect(a).not.toBe(b);
  });
});
