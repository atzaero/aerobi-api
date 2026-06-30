/**
 * Carrega o PNG da bandeira de uma UF a partir dos assets versionados em
 * `scripts/seeds/assets/flags/<UF>.png`. O caminho é resolvido por `__dirname`
 * (não `process.cwd()`) para funcionar igual em dev (ts-node) e em prod
 * (`node dist/scripts/run-seeds.js`, com os PNGs copiados para
 * `dist/scripts/seeds/assets` no Dockerfile). Valida o conteúdo por magic bytes
 * em paridade com o upload real do módulo de grupos.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { Uf } from '@/generated/prisma/enums';
import {
  detectImageMimetype,
  MAX_GROUP_IMAGE_SIZE_BYTES,
} from '@/modules/groups/utils/group-image';

/** Diretório dos PNGs versionados, relativo a este arquivo. */
const FLAGS_DIR = path.resolve(__dirname, '..', 'assets', 'flags');

/** Bandeira carregada e validada, pronta para upload. */
export type FlagFile = {
  buffer: Buffer;
  mimetype: 'image/png';
  sizeBytes: number;
  filename: string;
};

/**
 * Lê e valida a bandeira de `uf`. Lança com o caminho tentado se o arquivo não
 * existir, se o conteúdo não for um PNG válido (magic bytes) ou se exceder o
 * limite de tamanho da imagem de grupo.
 */
export async function loadFlagFile(uf: Uf): Promise<FlagFile> {
  const filename = `${uf}.png`;
  const absPath = path.join(FLAGS_DIR, filename);

  let buffer: Buffer;
  try {
    buffer = await readFile(absPath);
  } catch {
    throw new Error(
      `[seed:states] bandeira ausente para ${uf}: esperado em ${absPath}.`,
    );
  }

  if (detectImageMimetype(buffer) !== 'image/png') {
    throw new Error(
      `[seed:states] bandeira ${filename} não é um PNG válido (magic bytes).`,
    );
  }

  if (buffer.length > MAX_GROUP_IMAGE_SIZE_BYTES) {
    throw new Error(
      `[seed:states] bandeira ${filename} excede ${MAX_GROUP_IMAGE_SIZE_BYTES} bytes.`,
    );
  }

  return { buffer, mimetype: 'image/png', sizeBytes: buffer.length, filename };
}
