/**
 * Seed `cameras` — 2 câmeras de teste por aeródromo (paths `atzEx1`/`atzEx2` no
 * node `aerobi-edge-mvp`), apontando para os streams HLS vivos do mediamtx, para
 * validar a aba Vídeo ponta a ponta. Create-only pela unicidade de stream
 * `(icao, node, path)` — re-execução é no-op.
 *
 * Lê os aeródromos já presentes no banco (create os âncora com o seed
 * `aerodromes` antes). Guardado por `SEED_DEMO=true` — não entra em produção nem
 * em `RUN_SEEDS_ON_BOOT` sem habilitação explícita.
 *
 * Overrides por env (opcionais):
 *   SEED_CAMERA_NODE   node tailnet do mediamtx (default `aerobi-edge-mvp`).
 *   SEED_CAMERA_PATHS  paths por vírgula (default `atzEx1,atzEx2`).
 */
import {
  buildCameraSpecs,
  ensureSeedCamera,
  resolveCameraConfig,
} from './lib/cameras';
import type { SeedContext, SeedRunner } from './types';

export const camerasSeed: SeedRunner = {
  name: 'cameras',
  async run({ prisma, logger, env }: SeedContext): Promise<void> {
    if (env.SEED_DEMO?.trim() !== 'true') {
      logger.info(
        '[seed:cameras] SEED_DEMO!=true — skip (dados de demonstração).',
      );
      return;
    }

    const { node, paths } = resolveCameraConfig(env);

    const aerodromes = await prisma.aerodrome.findMany({
      where: { deletedAt: null },
      select: { id: true, icao: true },
      orderBy: { icao: 'asc' },
    });

    if (aerodromes.length === 0) {
      logger.warn(
        '[seed:cameras] nenhum aeródromo no banco — rode o seed `aerodromes` ' +
          'antes. Nada a semear.',
      );
      return;
    }

    let created = 0;
    let exists = 0;

    for (const aerodrome of aerodromes) {
      for (const spec of buildCameraSpecs(aerodrome, node, paths)) {
        const result = await ensureSeedCamera(prisma, spec);
        if (result === 'created') {
          created += 1;
        } else {
          exists += 1;
        }
      }
    }

    logger.info(
      `[seed:cameras] concluído — criadas: ${created}, existentes: ${exists} ` +
        `(node ${node}, paths ${paths.join(',')}, ${aerodromes.length} aeródromo(s)).`,
    );
  },
};
