-- Renomeia o domínio `AerodromeGroup`/`AerodromeGroupImage` para `Group`/`GroupImage`.
-- Operação puramente de rename (ALTER ... RENAME) — preserva todos os dados.
-- Tabelas, colunas, índices e constraints são renomeados explicitamente para
-- manter a convenção de nomes do Prisma e evitar drift na próxima migration.

-- aerodrome_groups -> groups
ALTER TABLE "aerodrome_groups" RENAME TO "groups";
ALTER TABLE "groups" RENAME CONSTRAINT "aerodrome_groups_pkey" TO "groups_pkey";
ALTER INDEX "aerodrome_groups_uf_idx" RENAME TO "groups_uf_idx";
ALTER TABLE "groups" RENAME COLUMN "group_name" TO "name";

-- aerodrome_group_images -> group_images
ALTER TABLE "aerodrome_group_images" RENAME TO "group_images";
ALTER TABLE "group_images" RENAME CONSTRAINT "aerodrome_group_images_pkey" TO "group_images_pkey";
ALTER TABLE "group_images" RENAME CONSTRAINT "aerodrome_group_images_group_id_fkey" TO "group_images_group_id_fkey";
ALTER INDEX "aerodrome_group_images_group_id_idx" RENAME TO "group_images_group_id_idx";

-- users.aerodrome_group_id -> users.group_id
ALTER TABLE "users" RENAME COLUMN "aerodrome_group_id" TO "group_id";
ALTER TABLE "users" RENAME CONSTRAINT "users_aerodrome_group_id_fkey" TO "users_group_id_fkey";
ALTER INDEX "users_aerodrome_group_id_idx" RENAME TO "users_group_id_idx";
