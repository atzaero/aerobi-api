-- CreateEnum
CREATE TYPE "OperationalEventType" AS ENUM ('NON_CONFORMITY_NO_LANDING_REQUEST');

-- CreateEnum
CREATE TYPE "OperationalEventStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');

-- CreateTable
CREATE TABLE "operational_event" (
    "id" UUID NOT NULL,
    "type" "OperationalEventType" NOT NULL,
    "status" "OperationalEventStatus" NOT NULL DEFAULT 'OPEN',
    "aerodrome" TEXT NOT NULL,
    "movement_id" UUID,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL,
    "detected_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notified_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMPTZ(3),
    "deleted_by" TEXT,

    CONSTRAINT "operational_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "operational_event_aerodrome_occurred_at_idx" ON "operational_event"("aerodrome", "occurred_at");

-- CreateIndex
CREATE INDEX "operational_event_type_status_idx" ON "operational_event"("type", "status");

-- CreateIndex
CREATE INDEX "operational_event_movement_id_idx" ON "operational_event"("movement_id");

-- CreateIndex
CREATE INDEX "operational_event_deleted_at_idx" ON "operational_event"("deleted_at");

-- AddForeignKey
ALTER TABLE "operational_event" ADD CONSTRAINT "operational_event_movement_id_fkey" FOREIGN KEY ("movement_id") REFERENCES "movement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
