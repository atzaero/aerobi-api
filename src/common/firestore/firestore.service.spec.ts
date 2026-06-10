import type { ConfigService } from '@nestjs/config';

import { FirestoreService } from './firestore.service';

function buildConfig(
  values: Record<string, string | undefined>,
): ConfigService {
  return {
    get: (key: string) => values[key],
  } as unknown as ConfigService;
}

describe('FirestoreService', () => {
  it('não derruba o boot quando faltam credenciais e lança erro claro só ao usar', () => {
    const config = buildConfig({});
    const service = new FirestoreService(config);

    expect(() => service.getFirestore()).toThrow(
      /Firestore indisponível: Firebase Admin não inicializado/,
    );
  });
});
