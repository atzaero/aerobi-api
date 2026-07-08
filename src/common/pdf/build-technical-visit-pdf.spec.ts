import type { TechnicalVisitResponseDTO } from '@/modules/technical-visits/dtos/technical-visit-response.dto';

import {
  buildTechnicalVisitPdfBuffer,
  buildTechnicalVisitPdfFilename,
} from './build-technical-visit-pdf';

const baseVisit = {
  id: 'v1',
  aerodromeName: 'Aeroporto de Teste',
  icao: 'SBTE',
  city: 'Teste',
  visitAt: '2024-06-01T09:00:00.000Z',
  visitorName: 'Fulano de Tal',
  modifiers: [],
} as unknown as TechnicalVisitResponseDTO;

describe('buildTechnicalVisitPdfBuffer', () => {
  it('gera um PDF válido (magic bytes %PDF)', async () => {
    const buffer = await buildTechnicalVisitPdfBuffer(baseVisit);
    expect(buffer.length).toBeGreaterThan(0);
    expect(buffer.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  });

  it('não derruba o PDF quando uma imagem da seção é inválida', async () => {
    const buffer = await buildTechnicalVisitPdfBuffer(baseVisit, {
      bySection: { fence: [Buffer.from('isto-nao-e-uma-imagem')] },
    });
    expect(buffer.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  });
});

describe('buildTechnicalVisitPdfFilename', () => {
  it.each<[string | null | undefined, string | null | undefined, string]>([
    ['SBGR', undefined, 'visita-tecnica-sbgr.pdf'],
    ['  SBGR  ', undefined, 'visita-tecnica-sbgr.pdf'],
    ['', 'Aeroporto de São Paulo', 'visita-tecnica-aeroporto-de-sao-paulo.pdf'],
    [null, 'Fazenda Céu Azul!!', 'visita-tecnica-fazenda-ceu-azul.pdf'],
    ['', '', 'visita-tecnica-visita.pdf'],
    [null, null, 'visita-tecnica-visita.pdf'],
  ])('icao=%s aerodromeName=%s → %s', (icao, name, expected) => {
    expect(buildTechnicalVisitPdfFilename(icao, name)).toBe(expected);
  });
});
