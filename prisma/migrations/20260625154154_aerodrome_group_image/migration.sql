-- AlterTable
ALTER TABLE "aerodrome_groups" ADD COLUMN     "image_key" TEXT;
-- CreateTable
CREATE TABLE "aerodrome_group_images" (
    "id" UUID NOT NULL,
    "group_id" UUID NOT NULL,
    "image_key" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "uploaded_by" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMPTZ(3),
    "deleted_by" TEXT,
    CONSTRAINT "aerodrome_group_images_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE INDEX "aerodrome_group_images_group_id_idx" ON "aerodrome_group_images"("group_id");
-- AddForeignKey
ALTER TABLE "aerodrome_group_images" ADD CONSTRAINT "aerodrome_group_images_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "aerodrome_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
