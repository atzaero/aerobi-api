-- AlterTable
ALTER TABLE "users" ADD COLUMN     "aerodrome_group_id" UUID,
ADD COLUMN     "state" "Uf";

-- CreateIndex
CREATE INDEX "users_aerodrome_group_id_idx" ON "users"("aerodrome_group_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_aerodrome_group_id_fkey" FOREIGN KEY ("aerodrome_group_id") REFERENCES "aerodrome_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
