-- CreateEnum
CREATE TYPE "RabSyncStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "rab_sync_state" (
    "id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "source_url" TEXT NOT NULL,
    "last_modified" TEXT,
    "content_length" BIGINT,
    "content_hash" TEXT,
    "parsed_row_count" INTEGER,
    "synced_at" TIMESTAMP(3),
    "status" "RabSyncStatus" NOT NULL DEFAULT 'PENDING',
    "error_message" TEXT,

    CONSTRAINT "rab_sync_state_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "rab_sync_state_period_key" ON "rab_sync_state"("period");

-- CreateTable
CREATE TABLE "rab_row" (
    "id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "marcas" TEXT NOT NULL,
    "proprietarios" TEXT,
    "operadores" TEXT,
    "nr_cert_matricula" TEXT,
    "nr_serie" TEXT,
    "cd_tipo" TEXT,
    "ds_modelo" TEXT,
    "nm_fabricante" TEXT,
    "cd_cls" TEXT,
    "nr_pmd" TEXT,
    "cd_tipo_icao" TEXT,
    "nr_tripulacao_min" TEXT,
    "nr_passageiros_max" TEXT,
    "nr_assentos" TEXT,
    "nr_ano_fabricacao" TEXT,
    "dt_validade_cva" TEXT,
    "dt_validade_ca" TEXT,
    "dt_canc" TEXT,
    "ds_motivo_canc" TEXT,
    "cd_interdicao" TEXT,
    "ds_gravame" TEXT,
    "dt_matricula" TEXT,
    "tp_motor" TEXT,
    "qt_motor" TEXT,
    "tp_pouso" TEXT,
    "tp_ca" TEXT,
    "cd_proposito_cave" TEXT,
    "cf_operacional" TEXT,
    "ds_categoria_homologacao" TEXT,
    "tp_operacao" TEXT,

    CONSTRAINT "rab_row_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "rab_row_period_marcas_key" ON "rab_row"("period", "marcas");
CREATE INDEX "rab_row_period_idx" ON "rab_row"("period");
