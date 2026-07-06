-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('IMAGE', 'KML', 'PLAN_ORDINANCE', 'REGISTRATION_ORDINANCE', 'GRANT_TERM', 'AERONAUTICAL_STUDY', 'OTHER_ORDINANCE', 'EXTRA');

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "aerodrome_id" UUID NOT NULL,
    "uf" TEXT,
    "type" "DocumentType" NOT NULL,
    "storage_key" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "uploaded_by" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMPTZ(3),
    "deleted_by" TEXT,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "documents_aerodrome_id_idx" ON "documents"("aerodrome_id");

-- CreateIndex
CREATE INDEX "documents_aerodrome_id_type_deleted_at_idx" ON "documents"("aerodrome_id", "type", "deleted_at");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_aerodrome_id_fkey" FOREIGN KEY ("aerodrome_id") REFERENCES "aerodromes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

