import { Expose, plainToInstance } from 'class-transformer';

import {
  NormalizeEmail,
  OptionalQueryBoolean,
  TrimOptionalString,
  TrimString,
} from './dto-transform.decorators';

class SampleDto {
  @TrimString()
  @Expose()
  name!: string;

  @TrimOptionalString()
  @Expose()
  title?: string;

  @NormalizeEmail()
  @Expose()
  email!: string;

  @OptionalQueryBoolean()
  @Expose()
  active?: boolean;
}

describe('dto-transform.decorators', () => {
  it('delega trim, normalização de email e booleano opcional de query', () => {
    const actual = plainToInstance(SampleDto, {
      name: '  Ana ',
      title: undefined,
      email: '  Ana@Test.COM  ',
      active: '',
    });

    expect(actual.name).toBe('Ana');
    expect(actual.title).toBeUndefined();
    expect(actual.email).toBe('ana@test.com');
    expect(actual.active).toBeUndefined();
  });

  it('TrimOptionalString preserva null vs trima string', () => {
    const a = plainToInstance(SampleDto, { title: null });
    expect(a.title).toBeNull();

    const b = plainToInstance(SampleDto, { title: '  x  ' });
    expect(b.title).toBe('x');
  });
});
