-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('complaint', 'question', 'suggestion', 'other');

-- CreateEnum
CREATE TYPE "ContactMessageStatus" AS ENUM ('pending', 'resolved');

-- CreateTable
CREATE TABLE "contact" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "ContactType" NOT NULL,
    "status" "ContactMessageStatus" NOT NULL DEFAULT 'pending',
    "session_hash" TEXT,
    "date" TEXT NOT NULL,
    "ip_hash" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMPTZ(3),
    "deleted_by" TEXT,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_deleted_at_idx" ON "contact"("deleted_at");

-- CreateIndex
CREATE INDEX "contact_status_idx" ON "contact"("status");

-- CreateIndex
CREATE INDEX "contact_type_idx" ON "contact"("type");

-- CreateIndex
CREATE INDEX "contact_session_hash_date_idx" ON "contact"("session_hash", "date");

-- CreateIndex
CREATE INDEX "contact_email_date_idx" ON "contact"("email", "date");

-- CreateIndex
CREATE INDEX "contact_ip_hash_date_idx" ON "contact"("ip_hash", "date");

-- CreateIndex
CREATE INDEX "contact_created_at_idx" ON "contact"("created_at");
