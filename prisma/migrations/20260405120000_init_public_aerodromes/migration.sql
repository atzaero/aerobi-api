-- CreateEnum
CREATE TYPE "PublicAerodromesSyncStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "public_aerodromes_sync_state" (
    "id" TEXT NOT NULL,
    "dataset_key" TEXT NOT NULL,
    "dataset_version" TEXT,
    "source_url" TEXT NOT NULL,
    "last_modified" TEXT,
    "content_length" BIGINT,
    "content_hash" TEXT,
    "parsed_row_count" INTEGER,
    "synced_at" TIMESTAMPTZ(3),
    "status" "PublicAerodromesSyncStatus" NOT NULL DEFAULT 'PENDING',
    "error_message" TEXT,

    CONSTRAINT "public_aerodromes_sync_state_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "public_aerodromes_sync_state_dataset_key_key" ON "public_aerodromes_sync_state"("dataset_key");

-- CreateTable
CREATE TABLE "public_aerodrome" (
    "id" TEXT NOT NULL,
    "codigo_oaci" TEXT,
    "ciad" TEXT NOT NULL,
    "nome" TEXT,
    "municipio" TEXT,
    "uf" TEXT,
    "municipio_servido" TEXT,
    "uf_servido" TEXT,
    "latitude" TEXT,
    "longitude" TEXT,
    "altitude" TEXT,
    "operacao_diurna" TEXT,
    "operacao_noturna" TEXT,
    "situacao" TEXT,
    "validade_registro" TEXT,
    "portaria_registro" TEXT,
    "link_portaria" TEXT,
    "lat_geo_point" TEXT,
    "lon_geo_point" TEXT,

    CONSTRAINT "public_aerodrome_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "public_aerodrome_ciad_key" ON "public_aerodrome"("ciad");
CREATE INDEX "public_aerodrome_codigo_oaci_idx" ON "public_aerodrome"("codigo_oaci");
CREATE INDEX "public_aerodrome_uf_municipio_idx" ON "public_aerodrome"("uf", "municipio");
