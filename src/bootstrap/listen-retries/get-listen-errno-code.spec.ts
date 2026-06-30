import { getListenErrnoCode } from './get-listen-errno-code';

describe('getListenErrnoCode', () => {
  it('extrai o code de um ErrnoException', () => {
    const err = Object.assign(new Error('busy'), { code: 'EADDRINUSE' });
    expect(getListenErrnoCode(err)).toBe('EADDRINUSE');
  });

  it('retorna undefined quando não há code string', () => {
    expect(getListenErrnoCode(new Error('sem code'))).toBeUndefined();
    expect(getListenErrnoCode({ code: 42 })).toBeUndefined();
    expect(getListenErrnoCode(null)).toBeUndefined();
    expect(getListenErrnoCode('EADDRINUSE')).toBeUndefined();
  });
});
