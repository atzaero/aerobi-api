/*
  Warnings:

  - You are about to drop the `aircraft_reading` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('LANDING', 'TAKEOFF');

-- CreateEnum
CREATE TYPE "MovementSource" AS ENUM ('AUTOMATIC', 'MANUAL');

-- DropTable
DROP TABLE "aircraft_reading";

-- CreateTable
CREATE TABLE "movement" (
    "id" UUID NOT NULL,
    "registration" TEXT NOT NULL,
    "confidence" TEXT,
    "reading_datetime" TIMESTAMPTZ(3) NOT NULL,
    "operation_type" "MovementType" NOT NULL,
    "source" "MovementSource" NOT NULL,
    "reading_status" TEXT,
    "revisor_id" TEXT,
    "image_key" TEXT,
    "comments" TEXT,
    "aerodrome" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMPTZ(3),
    "deleted_by" TEXT,

    CONSTRAINT "movement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movement_aircraft_snapshot" (
    "id" UUID NOT NULL,
    "movement_id" UUID NOT NULL,
    "rab_row_id" TEXT,
    "rab_period" TEXT,
    "marcas" TEXT,
    "proprietarios" TEXT,
    "operadores" TEXT,
    "nr_serie" TEXT,
    "ds_modelo" TEXT,
    "nm_fabricante" TEXT,
    "cd_tipo_icao" TEXT,
    "nr_pmd" TEXT,
    "nr_assentos" TEXT,
    "nr_ano_fabricacao" TEXT,
    "tp_motor" TEXT,
    "qt_motor" TEXT,
    "cf_operacional" TEXT,
    "tp_operacao" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movement_aircraft_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "movement_registration_idx" ON "movement"("registration");

-- CreateIndex
CREATE INDEX "movement_aerodrome_reading_datetime_idx" ON "movement"("aerodrome", "reading_datetime");

-- CreateIndex
CREATE INDEX "movement_reading_datetime_idx" ON "movement"("reading_datetime");

-- CreateIndex
CREATE INDEX "movement_deleted_at_idx" ON "movement"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "movement_aircraft_snapshot_movement_id_key" ON "movement_aircraft_snapshot"("movement_id");

-- CreateIndex
CREATE INDEX "movement_aircraft_snapshot_rab_row_id_idx" ON "movement_aircraft_snapshot"("rab_row_id");

-- AddForeignKey
ALTER TABLE "movement_aircraft_snapshot" ADD CONSTRAINT "movement_aircraft_snapshot_movement_id_fkey" FOREIGN KEY ("movement_id") REFERENCES "movement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
