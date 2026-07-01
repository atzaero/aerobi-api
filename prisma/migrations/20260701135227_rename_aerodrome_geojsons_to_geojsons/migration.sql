-- Renomeia o domínio `AerodromeGeojson` para `Geojson` em todo o schema.
-- O prefixo `aerodrome` era redundante: o vínculo com o aeródromo já é expresso
-- pela FK `aerodrome_id` (renomeada na migration anterior). O termo do domínio
-- (`Geojson`) permanece; apenas o prefixo cai.
-- Operação puramente de rename (ALTER ... RENAME) — preserva todos os dados.
-- Enums, tabela, índices e constraints são renomeados explicitamente para manter
-- a convenção de nomes do Prisma e evitar drift na próxima migration.

-- enums
ALTER TYPE "AerodromeGeojsonStatus" RENAME TO "GeojsonStatus";
ALTER TYPE "AerodromeGeojsonKind" RENAME TO "GeojsonKind";

-- aerodrome_geojsons -> geojsons
ALTER TABLE "aerodrome_geojsons" RENAME TO "geojsons";
ALTER TABLE "geojsons" RENAME CONSTRAINT "aerodrome_geojsons_pkey" TO "geojsons_pkey";
ALTER TABLE "geojsons" RENAME CONSTRAINT "aerodrome_geojsons_aerodrome_id_fkey" TO "geojsons_aerodrome_id_fkey";
ALTER INDEX "aerodrome_geojsons_aerodrome_id_key" RENAME TO "geojsons_aerodrome_id_key";
ALTER INDEX "aerodrome_geojsons_status_idx" RENAME TO "geojsons_status_idx";
