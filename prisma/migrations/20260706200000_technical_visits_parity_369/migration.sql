-- CreateEnum
CREATE TYPE "technical_visit_image_section" AS ENUM ('gates_padlocks', 'fence', 'standard_plate', 'quality', 'horizontal_signage', 'unobstructed_headboards', 'track_range', 'trash_debris', 'delimited_perimeter', 'extra');

-- AlterTable
ALTER TABLE "technical_visits" ADD COLUMN     "visitor_name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "city" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "ciad" TEXT,
ADD COLUMN     "designation" TEXT,
ADD COLUMN     "length" TEXT,
ADD COLUMN     "width" TEXT,
ADD COLUMN     "resistance" TEXT,
ADD COLUMN     "surface" TEXT,
ADD COLUMN     "altitude" TEXT,
ADD COLUMN     "modifier_at_times" TIMESTAMPTZ(3)[] DEFAULT ARRAY[]::TIMESTAMPTZ(3)[];

-- CreateTable
CREATE TABLE "technical_visit_images" (
    "id" UUID NOT NULL,
    "technical_visit_id" UUID NOT NULL,
    "section" "technical_visit_image_section" NOT NULL,
    "image_key" TEXT NOT NULL,
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

    CONSTRAINT "technical_visit_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "technical_visit_images_technical_visit_id_section_idx" ON "technical_visit_images"("technical_visit_id", "section");

-- AddForeignKey
ALTER TABLE "technical_visit_images" ADD CONSTRAINT "technical_visit_images_technical_visit_id_fkey" FOREIGN KEY ("technical_visit_id") REFERENCES "technical_visits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
