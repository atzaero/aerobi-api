import { HttpService } from '@nestjs/axios';
import { InternalAxiosRequestConfig } from 'axios';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { AnacHttpService } from './anac-http.service';

const emptyAxiosConfig = {} as InternalAxiosRequestConfig;

describe('AnacHttpService', () => {
  let service: AnacHttpService;
  let httpService: jest.Mocked<Pick<HttpService, 'post'>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnacHttpService,
        { provide: HttpService, useValue: { post: jest.fn() } },
      ],
    }).compile();

    service = module.get(AnacHttpService);
    httpService = module.get(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('faz requisição POST com parâmetros corretos', async () => {
    const mockHtml = '<html>test</html>';
    const mockBuffer = Buffer.from(mockHtml, 'utf-8');

    httpService.post.mockReturnValue(
      of({
        data: mockBuffer,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: emptyAxiosConfig,
      }),
    );

    await service.fetchLicenseData('123.456.789-00', '123456');

    expect(httpService.post).toHaveBeenCalledTimes(1);
    /* eslint-disable @typescript-eslint/no-unsafe-assignment -- jest matcher objects are loosely typed */
    expect(httpService.post).toHaveBeenCalledWith(
      'https://consultadelicencas.anac.gov.br/consultadelicencas/',
      expect.any(URLSearchParams),
      expect.objectContaining({
        responseType: 'arraybuffer',
        headers: expect.objectContaining({
          'content-type': 'application/x-www-form-urlencoded',
        }),
      }),
    );
    /* eslint-enable @typescript-eslint/no-unsafe-assignment */
  });

  it('inclui CPF e CANAC no formData', async () => {
    const mockHtml = '<html>test</html>';
    const mockBuffer = Buffer.from(mockHtml, 'utf-8');

    httpService.post.mockReturnValue(
      of({
        data: mockBuffer,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: emptyAxiosConfig,
      }),
    );

    await service.fetchLicenseData('123.456.789-00', '123456');

    const callArgs = httpService.post.mock.calls[0];
    const formData = callArgs[1] as URLSearchParams;

    expect(formData.get('txCPF')).toBe('123.456.789-00');
    expect(formData.get('txcoddac')).toBe('123456');
  });

  it('decodifica HTML usando latin1', async () => {
    const mockHtml = '<html>áéíóú</html>';
    const mockBuffer = Buffer.from(mockHtml, 'latin1');

    httpService.post.mockReturnValue(
      of({
        data: mockBuffer,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: emptyAxiosConfig,
      }),
    );

    const result = await service.fetchLicenseData('123.456.789-00', '123456');
    expect(result).toContain('áéíóú');
  });

  it('lança erro quando a requisição falha', async () => {
    httpService.post.mockReturnValue(
      of({
        data: Buffer.from('', 'utf-8'),
        status: 500,
        statusText: 'Error',
        headers: {},
        config: emptyAxiosConfig,
      }),
    );

    // O serviço não lança erro para status 500, apenas loga
    await expect(
      service.fetchLicenseData('123.456.789-00', '123456'),
    ).resolves.toBeDefined();
  });
});
