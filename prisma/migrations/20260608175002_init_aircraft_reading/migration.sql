-- CreateTable
CREATE TABLE "aircraft_reading" (
    "id" UUID NOT NULL,
    "registration" TEXT NOT NULL,
    "confidence" TEXT NOT NULL,
    "reading_datetime" TIMESTAMPTZ(3) NOT NULL,
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

    CONSTRAINT "aircraft_reading_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "aircraft_reading_registration_idx" ON "aircraft_reading"("registration");

-- CreateIndex
CREATE INDEX "aircraft_reading_aerodrome_reading_datetime_idx" ON "aircraft_reading"("aerodrome", "reading_datetime");

-- CreateIndex
CREATE INDEX "aircraft_reading_reading_datetime_idx" ON "aircraft_reading"("reading_datetime");

-- CreateIndex
CREATE INDEX "aircraft_reading_deleted_at_idx" ON "aircraft_reading"("deleted_at");
