/**
 * Idempotência das câmeras de demonstração — **create-only** pela unicidade de
 * stream `(icao, mediamtxNode, mediamtxPath)` entre ativas (mesma regra do
 * índice único parcial da tabela). São ponteiros para os streams HLS de teste do
 * mediamtx; nenhuma credencial é gravada.
 */
import type { PrismaClient } from '@/generated/prisma/client';

/** Node tailnet e paths padrão — streams de teste vivos do mediamtx. */
export const DEFAULT_CAMERA_NODE = 'aerobi-edge-mvp';
export const DEFAULT_CAMERA_PATHS = ['atzEx1', 'atzEx2'] as const;

/** Câmera a garantir para um aeródromo (1 por path). */
export type SeedCameraSpec = {
  aerodromeId: string;
  icao: string;
  name: string;
  mediamtxNode: string;
  mediamtxPath: string;
};

/** `created` quando inserida agora; `exists` quando já havia o stream ativo. */
export type EnsureCameraResult = 'created' | 'exists';

/** Node/paths resolvidos do env (overrides opcionais sobre os defaults). */
export function resolveCameraConfig(env: NodeJS.ProcessEnv): {
  node: string;
  paths: string[];
} {
  const node = env.SEED_CAMERA_NODE?.trim() || DEFAULT_CAMERA_NODE;
  const raw = env.SEED_CAMERA_PATHS?.trim();
  const parsed = raw
    ? raw
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
    : [];
  return {
    node,
    paths: parsed.length > 0 ? parsed : [...DEFAULT_CAMERA_PATHS],
  };
}

/**
 * Monta as specs de câmera de um aeródromo — uma por path, `Câmera 1..N`. O
 * `icao` acompanha o do aeródromo (campo desnormalizado da tabela).
 */
export function buildCameraSpecs(
  aerodrome: { id: string; icao: string },
  node: string,
  paths: string[],
): SeedCameraSpec[] {
  return paths.map((path, index) => ({
    aerodromeId: aerodrome.id,
    icao: aerodrome.icao,
    name: `Câmera ${index + 1}`,
    mediamtxNode: node,
    mediamtxPath: path,
  }));
}

/**
 * Cria a câmera se não existir stream ativo `(icao, node, path)`. Já existindo,
 * retorna `exists` sem tocar no registro. `createdBy: 'seed'` para rastreio.
 */
export async function ensureSeedCamera(
  prisma: PrismaClient,
  spec: SeedCameraSpec,
): Promise<EnsureCameraResult> {
  const existing = await prisma.camera.findFirst({
    where: {
      icao: spec.icao,
      mediamtxNode: spec.mediamtxNode,
      mediamtxPath: spec.mediamtxPath,
      deletedAt: null,
    },
    select: { id: true },
  });
  if (existing) {
    return 'exists';
  }

  await prisma.camera.create({
    data: {
      aerodrome: { connect: { id: spec.aerodromeId } },
      icao: spec.icao,
      name: spec.name,
      mediamtxNode: spec.mediamtxNode,
      mediamtxPath: spec.mediamtxPath,
      enabled: true,
      createdBy: 'seed',
    },
    select: { id: true },
  });

  return 'created';
}
