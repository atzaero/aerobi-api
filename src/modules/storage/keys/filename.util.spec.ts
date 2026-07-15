import {
  buildUniqueLeaf,
  buildUuidLeaf,
  extractExtension,
  resolveKeyExtension,
  slugifyFilename,
} from './filename.util';

const UUID = '11111111-2222-3333-4444-555555555555';

describe('extractExtension', () => {
  it('extrai a extensão em minúsculo, sem ponto', () => {
    expect(extractExtension('foto.JPEG')).toBe('jpeg');
    expect(extractExtension('doc.final.PDF')).toBe('pdf');
  });

  it('retorna vazio quando não há extensão utilizável', () => {
    expect(extractExtension('semext')).toBe('');
    expect(extractExtension('.gitignore')).toBe('');
    expect(extractExtension('termina.')).toBe('');
  });

  it('ignora diretórios do caminho', () => {
    expect(extractExtension('a/b/c/imagem.png')).toBe('png');
  });
});

describe('slugifyFilename', () => {
  it('remove acentos, baixa a caixa e colapsa separadores', () => {
    expect(slugifyFilename('Relatório Técnico 2026.PDF')).toBe(
      'relatorio-tecnico-2026.pdf',
    );
  });

  it('faz trim, colapsa separadores e remove hífens das pontas da string', () => {
    expect(slugifyFilename('  Foo   Bar.JPG  ')).toBe('foo-bar.jpg');
    expect(slugifyFilename('--relatorio--.pdf')).toBe('relatorio-.pdf');
  });

  it('usa o fallback quando o nome não tem caracteres válidos', () => {
    expect(slugifyFilename('@@@')).toBe('arquivo');
  });
});

describe('buildUuidLeaf', () => {
  it('anexa a extensão normalizada', () => {
    expect(buildUuidLeaf(UUID, 'JPG')).toBe(`${UUID}.jpg`);
    expect(buildUuidLeaf(UUID, '.png')).toBe(`${UUID}.png`);
  });

  it('sem extensão retorna apenas o uuid', () => {
    expect(buildUuidLeaf(UUID, '')).toBe(UUID);
  });
});

describe('buildUniqueLeaf', () => {
  it('compõe {uuid}-{slug} preservando nome/extensão', () => {
    expect(buildUniqueLeaf(UUID, 'Meu Documento.pdf')).toBe(
      `${UUID}-meu-documento.pdf`,
    );
  });
});

describe('resolveKeyExtension', () => {
  it('prefere a extensão do nome original', () => {
    expect(
      resolveKeyExtension({ originalFilename: 'x.KML', mimetype: 'image/png' }),
    ).toBe('kml');
  });

  it('cai para a extensão do mimetype de imagem quando o nome não tem', () => {
    expect(
      resolveKeyExtension({
        originalFilename: 'semext',
        mimetype: 'image/webp',
      }),
    ).toBe('webp');
    expect(resolveKeyExtension({ mimetype: 'image/jpeg' })).toBe('jpg');
  });

  it('usa "bin" quando não há como determinar', () => {
    expect(resolveKeyExtension({ mimetype: 'application/zip' })).toBe('bin');
    expect(resolveKeyExtension({})).toBe('bin');
  });
});
