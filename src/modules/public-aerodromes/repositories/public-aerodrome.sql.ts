import { Prisma } from '@/generated/prisma/client';

export const PUBLIC_AERODROME_CHUNK_SIZE = 500;

export const PUBLIC_AERODROME_INSERT_COLUMNS = Prisma.sql`(
  "id", "codigo_oaci", "ciad", "nome", "municipio", "uf",
  "municipio_servido", "uf_servido", "latitude", "longitude",
  "altitude", "operacao_diurna", "operacao_noturna", "situacao",
  "validade_registro", "portaria_registro", "link_portaria",
  "lat_geo_point", "lon_geo_point"
)`;

export const PUBLIC_AERODROME_CONFLICT_UPDATE = Prisma.sql`
  ON CONFLICT ("ciad") DO UPDATE SET
    "codigo_oaci" = EXCLUDED."codigo_oaci",
    "nome" = EXCLUDED."nome",
    "municipio" = EXCLUDED."municipio",
    "uf" = EXCLUDED."uf",
    "municipio_servido" = EXCLUDED."municipio_servido",
    "uf_servido" = EXCLUDED."uf_servido",
    "latitude" = EXCLUDED."latitude",
    "longitude" = EXCLUDED."longitude",
    "altitude" = EXCLUDED."altitude",
    "operacao_diurna" = EXCLUDED."operacao_diurna",
    "operacao_noturna" = EXCLUDED."operacao_noturna",
    "situacao" = EXCLUDED."situacao",
    "validade_registro" = EXCLUDED."validade_registro",
    "portaria_registro" = EXCLUDED."portaria_registro",
    "link_portaria" = EXCLUDED."link_portaria",
    "lat_geo_point" = EXCLUDED."lat_geo_point",
    "lon_geo_point" = EXCLUDED."lon_geo_point"
`;
