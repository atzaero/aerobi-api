-- CreateEnum
CREATE TYPE "PrivateAerodromesSyncStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "private_aerodromes_sync_state" (
    "id" TEXT NOT NULL,
    "dataset_key" TEXT NOT NULL,
    "dataset_version" TEXT,
    "source_url" TEXT NOT NULL,
    "last_modified" TEXT,
    "content_length" BIGINT,
    "content_hash" TEXT,
    "parsed_row_count" INTEGER,
    "synced_at" TIMESTAMPTZ(3),
    "status" "PrivateAerodromesSyncStatus" NOT NULL DEFAULT 'PENDING',
    "error_message" TEXT,

    CONSTRAINT "private_aerodromes_sync_state_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "private_aerodromes_sync_state_dataset_key_key" ON "private_aerodromes_sync_state"("dataset_key");

-- CreateTable
CREATE TABLE "private_aerodrome" (
    "id" TEXT NOT NULL,
    "codigo_oaci" TEXT,
    "ciad" TEXT NOT NULL,
    "nome" TEXT,
    "municipio" TEXT,
    "uf" TEXT,
    "longitude" TEXT,
    "latitude" TEXT,
    "altitude" TEXT,
    "operacao_diurna" TEXT,
    "operacao_noturna" TEXT,
    "designacao_1" TEXT,
    "comprimento_1" TEXT,
    "largura_1" TEXT,
    "resistencia_1" TEXT,
    "superficie_1" TEXT,
    "designacao_2" TEXT,
    "comprimento_2" TEXT,
    "largura_2" TEXT,
    "resistencia_2" TEXT,
    "superficie_2" TEXT,
    "portaria_registro" TEXT,
    "link_portaria" TEXT,
    "lat_geo_point" TEXT,
    "lon_geo_point" TEXT,

    CONSTRAINT "private_aerodrome_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "private_aerodrome_ciad_key" ON "private_aerodrome"("ciad");
CREATE INDEX "private_aerodrome_codigo_oaci_idx" ON "private_aerodrome"("codigo_oaci");
CREATE INDEX "private_aerodrome_uf_municipio_idx" ON "private_aerodrome"("uf", "municipio");
