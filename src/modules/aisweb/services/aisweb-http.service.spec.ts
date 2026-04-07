import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { Observable, of, throwError } from 'rxjs';

import { AiswebHttpService } from './aisweb-http.service';

const emptyAxiosConfig = {} as InternalAxiosRequestConfig;

function textAxiosResponse(
  status: number,
  data: string | number,
): AxiosResponse<string> {
  const body: string = typeof data === 'string' ? data : String(data);
  return {
    data: body,
    status,
    statusText: status >= 200 && status < 300 ? 'OK' : 'Error',
    headers: {},
    config: emptyAxiosConfig,
  };
}

function ofTextAxiosResponse(
  status: number,
  data: string | number,
): Observable<AxiosResponse<string>> {
  return of(textAxiosResponse(status, data));
}

describe('AiswebHttpService', () => {
  let service: AiswebHttpService;
  let httpService: jest.Mocked<Pick<HttpService, 'get'>>;
  let configService: jest.Mocked<Pick<ConfigService, 'get'>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiswebHttpService,
        { provide: HttpService, useValue: { get: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get(AiswebHttpService);
    httpService = module.get(HttpService);
    configService = module.get(ConfigService);
  });

  describe('getApiKey', () => {
    it('retorna a chave quando configurada', () => {
      configService.get.mockReturnValue('minha-chave');
      expect(service.getApiKey()).toBe('minha-chave');
    });

    it('lança ServiceUnavailableException quando a chave está ausente', () => {
      configService.get.mockReturnValue('');
      expect(() => service.getApiKey()).toThrow(ServiceUnavailableException);
    });

    it('lança ServiceUnavailableException quando a chave é undefined', () => {
      configService.get.mockReturnValue(undefined);
      expect(() => service.getApiKey()).toThrow(ServiceUnavailableException);
    });
  });

  describe('getApiPass', () => {
    it('retorna a senha quando configurada', () => {
      configService.get.mockReturnValue('minha-senha');
      expect(service.getApiPass()).toBe('minha-senha');
    });

    it('lança ServiceUnavailableException quando a senha está ausente', () => {
      configService.get.mockReturnValue('');
      expect(() => service.getApiPass()).toThrow(ServiceUnavailableException);
    });
  });

  describe('buildQueryString', () => {
    it('serializa parâmetros simples', () => {
      expect(service.buildQueryString({ a: 'foo', b: 'bar' })).toBe(
        'a=foo&b=bar',
      );
    });

    it('ignora valores undefined e string vazia', () => {
      expect(service.buildQueryString({ a: 'foo', b: undefined, c: '' })).toBe(
        'a=foo',
      );
    });

    it('codifica caracteres especiais', () => {
      expect(service.buildQueryString({ q: 'hello world' })).toBe(
        'q=hello%20world',
      );
    });

    it('serializa números corretamente', () => {
      expect(service.buildQueryString({ n: 42 })).toBe('n=42');
    });

    it('retorna string vazia para objeto vazio', () => {
      expect(service.buildQueryString({})).toBe('');
    });
  });

  describe('parseXml', () => {
    it('parseia XML simples corretamente', () => {
      const result = service.parseXml(
        '<aisweb><name>SBGR</name></aisweb>',
      ) as Record<string, unknown>;
      expect(result).toMatchObject({ aisweb: { name: 'SBGR' } });
    });

    it('parseia XML com atributos', () => {
      const result = service.parseXml(
        '<aisweb><list total="2"/></aisweb>',
      ) as Record<string, unknown>;
      const aisweb = result.aisweb as Record<string, unknown>;
      const list = aisweb.list as Record<string, unknown>;
      expect(list['@_total']).toBe('2');
    });
  });

  describe('fetchWithFallback', () => {
    it('retorna o texto da primeira URL com resposta 2xx', async () => {
      httpService.get.mockReturnValue(ofTextAxiosResponse(200, '<xml/>'));
      await expect(service.fetchWithFallback('area=test')).resolves.toBe(
        '<xml/>',
      );
      expect(httpService.get).toHaveBeenCalledTimes(1);
    });

    it('converte data não-string para string', async () => {
      httpService.get.mockReturnValue(ofTextAxiosResponse(200, 42));
      await expect(service.fetchWithFallback('area=test')).resolves.toBe('42');
    });

    it('tenta a segunda URL quando a primeira retorna status de erro', async () => {
      httpService.get
        .mockReturnValueOnce(ofTextAxiosResponse(503, ''))
        .mockReturnValueOnce(ofTextAxiosResponse(200, '<xml/>'));
      await expect(service.fetchWithFallback('area=test')).resolves.toBe(
        '<xml/>',
      );
      expect(httpService.get).toHaveBeenCalledTimes(2);
    });

    it('tenta a segunda URL quando a primeira lança erro de rede', async () => {
      httpService.get
        .mockReturnValueOnce(
          throwError(() =>
            Object.assign(new Error('ECONNREFUSED'), { isAxiosError: true }),
          ),
        )
        .mockReturnValueOnce(ofTextAxiosResponse(200, '<xml/>'));
      await expect(service.fetchWithFallback('area=test')).resolves.toBe(
        '<xml/>',
      );
    });

    it('lança BadGatewayException quando todas as URLs falham', async () => {
      httpService.get
        .mockReturnValueOnce(ofTextAxiosResponse(500, ''))
        .mockReturnValueOnce(ofTextAxiosResponse(500, ''));
      await expect(service.fetchWithFallback('area=test')).rejects.toThrow(
        BadGatewayException,
      );
    });
  });

  describe('executeXmlQuery', () => {
    beforeEach(() => {
      configService.get.mockReturnValue('test-value');
    });

    it('retorna o XML parseado em caso de sucesso', async () => {
      httpService.get.mockReturnValue(
        ofTextAxiosResponse(200, '<aisweb><area>sol</area></aisweb>'),
      );
      const result = (await service.executeXmlQuery('sol', {
        icaoCode: 'SBGR',
      })) as Record<string, unknown>;
      expect(result).toMatchObject({ aisweb: { area: 'sol' } });
    });

    it('lança UnprocessableEntityException quando o parseXml lança erro', async () => {
      httpService.get.mockReturnValue(ofTextAxiosResponse(200, '<xml/>'));
      jest.spyOn(service, 'parseXml').mockImplementation(() => {
        throw new Error('parse error simulado');
      });
      await expect(service.executeXmlQuery('sol', {})).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('propaga BadGatewayException do fetchWithFallback', async () => {
      httpService.get.mockReturnValue(ofTextAxiosResponse(503, ''));
      await expect(service.executeXmlQuery('infotemp', {})).rejects.toThrow(
        BadGatewayException,
      );
    });
  });
});
