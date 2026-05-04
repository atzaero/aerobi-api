import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';

import { calculateValidity } from '../utils/validity-calculator.util';
import { parseDate } from '../utils/date-parser.util';
import {
  PilotLicenseResponseDto,
  PilotLicenseDadosDto,
} from '../dtos/pilot-license-response.dto';
import { LicenseDto } from '../dtos/license.dto';
import { HabilitacaoDto } from '../dtos/habilitacao.dto';
import { CertificadoMedicoDto } from '../dtos/certificado-medico.dto';

type ScrapedPersonalData = {
  nome?: string;
  dataNascimento?: string;
  canac?: string;
  tabelaPrincipalEncontrada?: boolean;
};

@Injectable()
export class AnacScraperService {
  private readonly logger = new Logger(AnacScraperService.name);

  scrapeLicenseData(
    html: string,
    canac: string,
  ): Promise<PilotLicenseResponseDto> {
    const $ = cheerio.load(html);

    this.logger.debug('HTML length:', html.length);

    const data: ScrapedPersonalData = {};
    const licencas: LicenseDto[] = [];
    const habilitacoes: HabilitacaoDto[] = [];
    const certificadoMedico: CertificadoMedicoDto[] = [];

    // Procurar pela tabela principal com dados pessoais
    $('table').each((_index: number, table: Element) => {
      const $table = $(table);
      const $rows = $table.find('tr');
      let foundData = false;

      $rows.each((_index: number, row: Element) => {
        const $row = $(row);
        const $cells = $row.find('td');

        if ($cells.length >= 2) {
          const firstCell = $cells.eq(0).text().trim();
          const secondCell = $cells.eq(1).text().trim();

          if (firstCell.includes('Nome') && firstCell.includes('>')) {
            data.nome = secondCell.trim();
            foundData = true;
          } else if (firstCell.includes('Data de Nascimento')) {
            data.dataNascimento = secondCell.trim();
            foundData = true;
          } else if (firstCell.includes('Código ANAC')) {
            data.canac = secondCell.trim();
            foundData = true;
          }
        }
      });

      if (foundData) {
        data.tabelaPrincipalEncontrada = true;
      }
    });

    // Procurar tabela de HABILITAÇÕES
    $('table').each((_index: number, table: Element) => {
      const $table = $(table);
      const $headerRow = $table.find('tr').first();
      const $headerCell = $headerRow.find('td[colspan]');

      if ($headerCell.length > 0) {
        const headerText = $headerCell.text().trim();
        if (headerText === 'HABILITAÇÕES') {
          let isHeader = true;
          $table.find('tr').each((_index: number, row: Element) => {
            if (isHeader) {
              isHeader = false;
              return;
            }

            const $row = $(row);
            const $cells = $row.find('td');

            if ($cells.length >= 4) {
              const tipo = $cells.eq(0).text().trim();
              const validade = $cells.eq(1).text().trim();
              const funcao = $cells.eq(2).text().trim();
              const situacao = $cells.eq(3).text().trim();

              if (
                tipo &&
                tipo !== 'Tipo' &&
                validade &&
                validade !== 'Validade' &&
                tipo.length < 50 &&
                !tipo.includes('>')
              ) {
                habilitacoes.push({ tipo, validade, funcao, situacao });
              }
            }
          });
        }
      }
    });

    // Procurar tabela de LICENÇAS
    $('table').each((_index: number, table: Element) => {
      const $table = $(table);
      const $headerRow = $table.find('tr').first();
      const $headerCell = $headerRow.find('td[colspan]');

      if ($headerCell.length > 0) {
        const headerText = $headerCell.text().trim();
        if (headerText === 'LICENÇAS') {
          let isHeader = true;
          $table.find('tr').each((_index: number, row: Element) => {
            if (isHeader) {
              isHeader = false;
              return;
            }

            const $row = $(row);
            const $cells = $row.find('td');

            if ($cells.length >= 4) {
              const tipo = $cells.eq(0).text().trim();
              const dataExpedicao = $cells.eq(1).text().trim();
              void $cells.eq(2).text().trim();
              void $cells.eq(3).text().trim();

              if (
                tipo &&
                tipo !== 'Licença' &&
                tipo.length < 100 &&
                !tipo.includes('>')
              ) {
                licencas.push({
                  tipo,
                  validade: dataExpedicao,
                  valida: true,
                  emTolerancia: false,
                });
              }
            }
          });
        }
      }
    });

    // Procurar tabela de Certificado Médico Aeronáutico
    $('table').each((_index: number, table: Element) => {
      const $table = $(table);
      const $headerRow = $table.find('tr').first();
      const $headerCell = $headerRow.find('td[colspan]');

      if ($headerCell.length > 0) {
        const headerText = $headerCell.text().trim();
        if (headerText === 'Certificado Médico Aeronáutico') {
          let isHeader = true;
          $table.find('tr').each((_index: number, row: Element) => {
            if (isHeader) {
              isHeader = false;
              return;
            }

            const $row = $(row);
            const $cells = $row.find('td');

            if ($cells.length >= 4) {
              const classe = $cells.eq(0).text().trim();
              const validade = $cells.eq(1).text().trim();
              const orgao = $cells.eq(2).text().trim();
              const observacoes = $cells.eq(3).text().trim();

              if (
                classe &&
                classe !== 'Classe' &&
                classe !== 'FS RH' &&
                classe.length < 20 &&
                !classe.includes('>')
              ) {
                certificadoMedico.push({
                  classe,
                  validade,
                  orgao,
                  observacoes,
                });
              }
            }
          });
        }
      }
    });

    const possuiCarteira = data.tabelaPrincipalEncontrada || false;

    // Usar a validade da habilitação mais recente
    let validadePrincipal: string | null = null;
    if (habilitacoes.length > 0) {
      const datasValidade = habilitacoes
        .map((h) => h.validade)
        .filter((v): v is string =>
          Boolean(v && /\d{2}\/\d{2}\/\d{4}/.exec(v)),
        );

      if (datasValidade.length > 0) {
        datasValidade.sort((a, b) => {
          const dateA = parseDate(a);
          const dateB = parseDate(b);
          if (!dateA || !dateB) return 0;
          return dateB.getTime() - dateA.getTime();
        });
        validadePrincipal = datasValidade[0];
      }
    }

    // Calcular validade principal
    const validityResult = calculateValidity(validadePrincipal);

    const dados: PilotLicenseDadosDto = {
      nome: data.nome,
      data_nascimento: data.dataNascimento,
      canac: data.canac ?? canac ?? undefined,
      licencas: licencas.length > 0 ? licencas : undefined,
      habilitacoes: habilitacoes.length > 0 ? habilitacoes : undefined,
      certificado_medico:
        certificadoMedico.length > 0 ? certificadoMedico : undefined,
      raw_data: data as Record<string, any>,
    };

    const result: PilotLicenseResponseDto = {
      valido: validityResult.valida,
      possui_carteira: possuiCarteira,
      validade: validadePrincipal || undefined,
      em_periodo_tolerancia: validityResult.emTolerancia,
      dias_para_vencimento: validityResult.diasParaVencimento,
      dados,
    };

    return Promise.resolve(result);
  }
}
