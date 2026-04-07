import { unwrapCdata } from './aisweb-xml-cdata.util';

describe('unwrapCdata', () => {
  it('retorna string direta sem modificação', () => {
    expect(unwrapCdata('SBGR')).toBe('SBGR');
  });

  it('retorna string vazia para null e undefined', () => {
    expect(unwrapCdata(null)).toBe('');
    expect(unwrapCdata(undefined)).toBe('');
  });

  it('converte número para string', () => {
    expect(unwrapCdata(42)).toBe('42');
    expect(unwrapCdata(3.14)).toBe('3.14');
  });

  it('converte boolean para string', () => {
    expect(unwrapCdata(true)).toBe('true');
    expect(unwrapCdata(false)).toBe('false');
  });

  it('extrai #text de objeto CDATA (fast-xml-parser v5 estilo objeto)', () => {
    expect(unwrapCdata({ '#text': 'Guarulhos' })).toBe('Guarulhos');
  });

  it('extrai #text de objeto CDATA aninhado em array (fast-xml-parser v5 estilo array)', () => {
    expect(unwrapCdata([{ '#text': 'São Paulo' }])).toBe('São Paulo');
  });

  it('retorna primeiro elemento de array de strings', () => {
    expect(unwrapCdata(['SBSP', 'SBGR'])).toBe('SBSP');
  });

  it('retorna vazio para array vazio', () => {
    expect(unwrapCdata([])).toBe('');
  });

  it('retorna vazio para objeto sem #text', () => {
    expect(unwrapCdata({ key: 'value' })).toBe('');
  });

  it('resolve #text recursivamente quando é array', () => {
    expect(unwrapCdata({ '#text': [{ '#text': 'aninhado' }] })).toBe(
      'aninhado',
    );
  });

  it('retorna vazio quando #text é null', () => {
    expect(unwrapCdata({ '#text': null })).toBe('');
  });
});
