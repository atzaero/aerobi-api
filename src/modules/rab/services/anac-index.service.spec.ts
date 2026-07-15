import type { HttpService } from '@nestjs/axios';
import type { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';

import { AnacIndexService } from './anac-index.service';

const INDEX_URL = 'https://anac.example/RAB/Historico_RAB/';

function buildService(html: string, indexUrl: string | undefined = INDEX_URL) {
  const get = jest.fn().mockReturnValue(of({ data: html }));
  const http = { get } as unknown as HttpService;
  const config = {
    get: jest.fn().mockReturnValue(indexUrl),
  } as unknown as ConfigService;
  return { service: new AnacIndexService(http, config), get };
}

describe('AnacIndexService', () => {
  describe('execute', () => {
    it('extrai os períodos YYYY-MM do índice HTML e retorna o mais recente', async () => {
      const html = `
        <a href="2025-12.csv">dez</a>
        <a href="2026-01.csv">jan</a>
        <a href="2026-03.csv">mar</a>
        <a href="2026-02.csv">fev</a>
      `;
      const { service, get } = buildService(html);

      await expect(service.execute()).resolves.toBe('2026-03');
      expect(get).toHaveBeenCalledWith(INDEX_URL, { responseType: 'text' });
    });

    it('deduplica links repetidos do mesmo período', async () => {
      const html = `<a href="2026-01.csv">a</a><a href="2026-01.csv">b</a>`;
      const { service } = buildService(html);

      await expect(service.execute()).resolves.toBe('2026-01');
    });

    it('lança quando o índice não tem nenhum CSV YYYY-MM', async () => {
      const { service } = buildService('<html>sem links</html>');

      await expect(service.execute()).rejects.toThrow(
        /Nenhum CSV YYYY-MM encontrado/,
      );
    });
  });

  describe('getIndexUrl', () => {
    it('usa o valor de ANAC_RAB_INDEX_URL quando configurado', () => {
      const { service } = buildService('', 'https://custom/rab/');

      expect(service.getIndexUrl()).toBe('https://custom/rab/');
    });

    it('cai no default da ANAC quando a env não está definida', () => {
      const http = { get: jest.fn() } as unknown as HttpService;
      const config = {
        get: jest.fn().mockReturnValue(undefined),
      } as unknown as ConfigService;
      const service = new AnacIndexService(http, config);

      expect(service.getIndexUrl()).toContain('sistemas.anac.gov.br');
    });
  });

  describe('csvUrlForPeriod', () => {
    it('monta a URL do CSV garantindo a barra final na base', () => {
      const { service } = buildService('', 'https://custom/rab');

      expect(service.csvUrlForPeriod('2026-03')).toBe(
        'https://custom/rab/2026-03.csv',
      );
    });
  });
});
