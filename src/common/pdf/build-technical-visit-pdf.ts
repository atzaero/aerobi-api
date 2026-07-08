import PDFDocument from 'pdfkit';

import type { TechnicalVisitImageSection } from '@/generated/prisma/client';

import type { TechnicalVisitResponseDTO } from '@/modules/technical-visits/dtos/technical-visit-response.dto';

/** Buffers das imagens já baixadas do storage, agrupados por seção de inspeção. */
export interface TechnicalVisitPdfImageBuffers {
  bySection: Partial<Record<TechnicalVisitImageSection, Buffer[]>>;
}

/** Marca de checklist `[X]`/`[ ]` para um item booleano do formulário. */
function check(value: boolean | null | undefined): string {
  return value ? '[X]' : '[ ]';
}

/** Formata a data da visita em `dd/mm/aaaa` (pt-BR). */
function formatVisitDate(visitAt: string): string {
  return new Date(visitAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Formata a data/hora de um modificador em `dd/mm/aaaa hh:mm` (pt-BR); vazio se ausente. */
function formatModifierDate(date: string | null): string {
  if (!date) return '';
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Desenha as imagens de uma seção num grid de 2 colunas, quebrando a página
 * quando a próxima linha ultrapassaria a margem inferior. Imagem inválida é
 * omitida sem derrubar o PDF.
 */
function writeImageGrid(
  doc: PDFKit.PDFDocument,
  buffers: Buffer[] | undefined,
): void {
  if (!buffers?.length) return;
  const columnWidth = (doc.page.width - 96) / 2 - 4;
  const rowHeight = 120;
  for (let i = 0; i < buffers.length; i += 2) {
    const row = buffers.slice(i, i + 2);
    /** Quebra a página quando a próxima linha do grid passaria da margem inferior. */
    if (doc.y + rowHeight + 8 > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
    }
    const startY = doc.y;
    let maxHeight = 0;
    row.forEach((buffer, idx) => {
      try {
        const x = 48 + idx * (columnWidth + 8);
        doc.image(buffer, x, startY, { fit: [columnWidth, 120] });
        maxHeight = Math.max(maxHeight, 120);
      } catch {
        /** Imagem inválida — omitir sem derrubar o PDF. */
      }
    });
    doc.y = startY + maxHeight + 8;
  }
  doc.moveDown(0.4);
}

/** Escreve um item de inspeção: marca + label, observação opcional e o grid de fotos. */
function writeInspectionItem(
  doc: PDFKit.PDFDocument,
  label: string,
  checked: boolean | null | undefined,
  observation: string | null | undefined,
  imageBuffers?: Buffer[],
): void {
  doc.fontSize(11).text(`${check(checked)} ${label}`);
  if (observation) {
    doc.fontSize(10).fillColor('#52525b').text(`Observação: ${observation}`);
    doc.fillColor('#000000');
  }
  doc.moveDown(0.4);
  writeImageGrid(doc, imageBuffers);
}

/** Rodapé de marca ancorado ao fundo da página (desenhado em cada página). */
function drawFooter(doc: PDFKit.PDFDocument): void {
  doc
    .fontSize(8)
    .fillColor('#a1a1aa')
    .text(
      'Aerobi · Gestão aeroportuária · aerobi.com.br',
      48,
      doc.page.height - 36,
      {
        align: 'center',
        width: doc.page.width - 96,
      },
    );
}

/**
 * Gera o PDF da visita técnica (A4) — paridade estrutural com `build-visit-pdf.ts`
 * do aerobi-web, usando pdfkit server-side (#369 Bloco G).
 */
export function buildTechnicalVisitPdfBuffer(
  visit: TechnicalVisitResponseDTO,
  imageBuffers: TechnicalVisitPdfImageBuffers = { bySection: {} },
): Promise<Buffer> {
  const { bySection } = imageBuffers;
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 48, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc
      .fontSize(16)
      .fillColor('#1e3a5f')
      .text('FORMULÁRIO DE VISITA PERIÓDICA EM AERÓDROMO', {
        align: 'center',
      });
    doc.moveDown();
    doc.fillColor('#000000').fontSize(11);
    doc.text(`Aeródromo: ${visit.aerodromeName}    ICAO: ${visit.icao}`);
    doc.text(
      `Cidade: ${visit.city}    Data da visita: ${formatVisitDate(visit.visitAt)}`,
    );
    doc.text(
      `Designação: ${visit.designation ?? ''}    Superfície: ${visit.surface ?? ''}`,
    );
    doc.text(
      `Comprimento: ${visit.length ?? ''}    Largura: ${visit.width ?? ''}`,
    );
    doc.text(
      `Resistência: ${visit.resistance ?? ''}    Altitude: ${visit.altitude ?? ''}`,
    );
    doc.moveDown();

    doc.fontSize(13).fillColor('#1e3a5f').text('Itens verificados');
    doc.fillColor('#000000').moveDown(0.3);

    writeInspectionItem(
      doc,
      'Portões e cadeados (para evitar entrada não autorizada)',
      visit.hasGatesPadlocks,
      visit.gatesPadlocksObservation,
      bySection.gates_padlocks,
    );
    writeInspectionItem(
      doc,
      'Cerca patrimonial (para evitar entrada de pessoas e animais)',
      visit.hasFence,
      visit.fenceObservation,
      bySection.fence,
    );
    writeInspectionItem(
      doc,
      'Placa padrão de identificação do aeródromo em bom estado?',
      visit.hasStandardPlate,
      visit.standardPlateObservation,
      bySection.standard_plate,
    );
    doc.fontSize(11).text('Qualidade do pavimento da pista');
    doc.text(`${check(visit.hasQualityHoles)} Buracos?`);
    doc.text(`${check(visit.hasQualityAsphalt)} Asfalto descascando?`);
    doc.text(`${check(visit.hasQualityOthers)} Outros?`);
    if (visit.qualityOthersObservation) {
      doc
        .fontSize(10)
        .fillColor('#52525b')
        .text(`Outros: ${visit.qualityOthersObservation}`);
      doc.fillColor('#000000');
    }
    if (visit.qualityObservation) {
      doc
        .fontSize(10)
        .fillColor('#52525b')
        .text(`Observação: ${visit.qualityObservation}`);
      doc.fillColor('#000000');
    }
    writeImageGrid(doc, bySection.quality);
    doc.moveDown(0.4);

    writeInspectionItem(
      doc,
      'Sinalização horizontal visível e em bom estado?',
      visit.hasHorizontalSignage,
      visit.horizontalSignageObservation,
      bySection.horizontal_signage,
    );
    writeInspectionItem(
      doc,
      'Cabeceiras desobstruídas?',
      visit.hasUnobstructedHeadboards,
      visit.unobstructedHeadboardsObservation,
      bySection.unobstructed_headboards,
    );
    doc
      .fontSize(11)
      .text(`${check(visit.hasTrackRange)} Faixa de pista desobstruída?`);
    doc.text(`${check(visit.pavementRegularity)} Pavimento regular (plano)?`);
    if (visit.trackRangeObservation) {
      doc
        .fontSize(10)
        .fillColor('#52525b')
        .text(`Observação: ${visit.trackRangeObservation}`);
      doc.fillColor('#000000');
    }
    writeImageGrid(doc, bySection.track_range);
    doc.moveDown(0.4);

    writeInspectionItem(
      doc,
      'Existe lixo ou detritos na área do aeródromo?',
      visit.hasTrashDebris,
      visit.trashDebrisObservation,
      bySection.trash_debris,
    );
    doc
      .fontSize(11)
      .text(
        `${check(visit.hasDelimitedPerimeter)} Perímetro delimitado por cerca mantido?`,
      );
    doc.text(`${check(visit.hasInvasion)} Existe algum tipo de invasão?`);
    if (visit.delimitedPerimeterObservation) {
      doc
        .fontSize(10)
        .fillColor('#52525b')
        .text(`Observação: ${visit.delimitedPerimeterObservation}`);
      doc.fillColor('#000000');
    }
    writeImageGrid(doc, bySection.delimited_perimeter);
    doc.moveDown(0.4);

    if (visit.extraObservation || bySection.extra?.length) {
      doc.fontSize(13).fillColor('#1e3a5f').text('Observações adicionais');
      doc.fillColor('#000000');
      if (visit.extraObservation) {
        doc.fontSize(10).text(visit.extraObservation);
      }
      doc.moveDown();
    }
    writeImageGrid(doc, bySection.extra);

    if (visit.modifiers.length > 0) {
      doc.fontSize(13).fillColor('#1e3a5f').text('Histórico de modificações');
      doc.fillColor('#000000').fontSize(10);
      for (const modifier of visit.modifiers) {
        const suffix = modifier.date
          ? ` — ${formatModifierDate(modifier.date)}`
          : '';
        doc.text(`${modifier.name}${suffix}`);
      }
      doc.moveDown();
    }

    doc.moveDown(2);
    doc.text('_______________________________', { align: 'center' });
    doc.text(visit.visitorName, { align: 'center' });

    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(pages.start + i);
      drawFooter(doc);
    }

    doc.end();
  });
}

/**
 * Normaliza um texto para uso seguro em nome de ficheiro: remove acentos
 * (NFD), baixa a caixa e troca sequências não-alfanuméricas por `-`.
 */
function slugifyForFilename(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Nome do arquivo do PDF: `visita-tecnica-{slug}.pdf`. O slug deriva do ICAO ou,
 * se vazio, do nome do aeródromo (paridade com `export/service.ts` do web);
 * fallback final `visita`.
 */
export function buildTechnicalVisitPdfFilename(
  icao: string | null | undefined,
  aerodromeName?: string | null,
): string {
  const slug = slugifyForFilename(icao?.trim() || aerodromeName || '');
  return `visita-tecnica-${slug || 'visita'}.pdf`;
}
