import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';

import { AnacPrivateAerodromesSourceService } from './anac-private-aerodromes-source.service';

const DEFAULT_URL =
  'https://sistemas.anac.gov.br/dadosabertos/Aerodromos/Aer%C3%B3dromos%20Privados/Lista%20de%20aer%C3%B3dromos%20privados/Aerodromos%20Privados/AerodromosPrivados.csv';

describe('AnacPrivateAerodromesSourceService', () => {
  let service: AnacPrivateAerodromesSourceService;
  let httpHead: jest.Mock;
  let httpGet: jest.Mock;
  let configGet: jest.Mock;

  beforeEach(() => {
    httpHead = jest.fn();
    httpGet = jest.fn();
    configGet = jest.fn().mockReturnValue(undefined);

    const http = { head: httpHead, get: httpGet } as unknown as HttpService;
    const config = { get: configGet } as unknown as ConfigService;
    service = new AnacPrivateAerodromesSourceService(http, config);
  });

  describe('getCsvUrl', () => {
    it('retorna URL configurada via ConfigService', () => {
      configGet.mockReturnValue('https://custom.url/aerodromes.csv');

      expect(service.getCsvUrl()).toBe('https://custom.url/aerodromes.csv');
    });

    it('retorna URL padrão quando ConfigService retorna undefined', () => {
      configGet.mockReturnValue(undefined);

      expect(service.getCsvUrl()).toBe(DEFAULT_URL);
    });
  });

  describe('extractDatasetVersionFromCsv', () => {
    it('extrai data quando padrão "Atualizado em: YYYY-MM-DD" está presente', () => {
      const text = 'Atualizado em: 2024-03-10\nCIAD;Nome\nSJXX;Teste';
      const buffer = Buffer.from(new TextEncoder().encode(text));

      expect(service.extractDatasetVersionFromCsv(buffer)).toBe('2024-03-10');
    });

    it('retorna "unknown" quando padrão não é encontrado', () => {
      const buffer = Buffer.from('sem data aqui\nCIAD;Nome');

      expect(service.extractDatasetVersionFromCsv(buffer)).toBe('unknown');
    });

    it('é case-insensitive para "Atualizado em:"', () => {
      const text = 'ATUALIZADO EM: 2025-06-01\nCIAD;Nome';
      const buffer = Buffer.from(new TextEncoder().encode(text));

      expect(service.extractDatasetVersionFromCsv(buffer)).toBe('2025-06-01');
    });
  });

  describe('head', () => {
    it('chama http.head com a URL correta e retorna resultado', async () => {
      const response = { status: 200, headers: { 'content-length': '1024' } };
      httpHead.mockReturnValue(of(response));

      const result = await service.head();

      expect(httpHead).toHaveBeenCalledWith(DEFAULT_URL);
      expect(result).toEqual(response);
    });

    it('chama http.head com URL configurada quando definida', async () => {
      configGet.mockReturnValue('https://custom.url/file.csv');
      httpHead.mockReturnValue(of({ status: 200, headers: {} }));

      await service.head();

      expect(httpHead).toHaveBeenCalledWith('https://custom.url/file.csv');
    });
  });

  describe('download', () => {
    it('chama http.get com responseType arraybuffer e URL correta', async () => {
      const response = { status: 200, headers: {}, data: new ArrayBuffer(8) };
      httpGet.mockReturnValue(of(response));

      const result = await service.download();

      expect(httpGet).toHaveBeenCalledWith(
        DEFAULT_URL,
        expect.objectContaining({ responseType: 'arraybuffer' }),
      );
      expect(result).toEqual(response);
    });
  });
});
