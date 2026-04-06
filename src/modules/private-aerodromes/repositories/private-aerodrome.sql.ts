import { Prisma } from '@/generated/prisma/client';

export const PRIVATE_AERODROME_CHUNK_SIZE = 500;

export const PRIVATE_AERODROME_INSERT_COLUMNS = Prisma.sql`(
  "id", "codigo_oaci", "ciad", "nome", "municipio", "uf",
  "longitude", "latitude", "altitude", "operacao_diurna",
  "operacao_noturna", "designacao_1", "comprimento_1", "largura_1",
  "resistencia_1", "superficie_1", "designacao_2", "comprimento_2",
  "largura_2", "resistencia_2", "superficie_2", "portaria_registro",
  "link_portaria", "lat_geo_point", "lon_geo_point"
)`;

export const PRIVATE_AERODROME_CONFLICT_UPDATE = Prisma.sql`
  ON CONFLICT ("ciad") DO UPDATE SET
    "codigo_oaci" = EXCLUDED."codigo_oaci",
    "nome" = EXCLUDED."nome",
    "municipio" = EXCLUDED."municipio",
    "uf" = EXCLUDED."uf",
    "longitude" = EXCLUDED."longitude",
    "latitude" = EXCLUDED."latitude",
    "altitude" = EXCLUDED."altitude",
    "operacao_diurna" = EXCLUDED."operacao_diurna",
    "operacao_noturna" = EXCLUDED."operacao_noturna",
    "designacao_1" = EXCLUDED."designacao_1",
    "comprimento_1" = EXCLUDED."comprimento_1",
    "largura_1" = EXCLUDED."largura_1",
    "resistencia_1" = EXCLUDED."resistencia_1",
    "superficie_1" = EXCLUDED."superficie_1",
    "designacao_2" = EXCLUDED."designacao_2",
    "comprimento_2" = EXCLUDED."comprimento_2",
    "largura_2" = EXCLUDED."largura_2",
    "resistencia_2" = EXCLUDED."resistencia_2",
    "superficie_2" = EXCLUDED."superficie_2",
    "portaria_registro" = EXCLUDED."portaria_registro",
    "link_portaria" = EXCLUDED."link_portaria",
    "lat_geo_point" = EXCLUDED."lat_geo_point",
    "lon_geo_point" = EXCLUDED."lon_geo_point"
`;
