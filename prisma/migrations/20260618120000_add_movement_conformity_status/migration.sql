-- CreateEnum
CREATE TYPE "ConformityStatus" AS ENUM ('PENDING', 'CONFORMANT', 'NON_CONFORMANT', 'NOT_APPLICABLE');

-- AlterTable
ALTER TABLE "movement" ADD COLUMN "conformity_status" "ConformityStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "movement_conformity_status_idx" ON "movement"("conformity_status");

-- Backfill: movimentos a que a regra não se aplica (não é pouso, ou sem ICAO).
UPDATE "movement"
SET "conformity_status" = 'NOT_APPLICABLE'
WHERE "deleted_at" IS NULL
  AND ("operation_type" <> 'LANDING' OR "aerodrome" IS NULL);

-- Backfill: pousos com ICAO que já têm uma não-conformidade registrada.
UPDATE "movement" m
SET "conformity_status" = 'NON_CONFORMANT'
WHERE m."deleted_at" IS NULL
  AND m."operation_type" = 'LANDING'
  AND m."aerodrome" IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM "operational_event" oe
    WHERE oe."movement_id" = m."id"
      AND oe."type" = 'NON_CONFORMITY_NO_LANDING_REQUEST'
      AND oe."deleted_at" IS NULL
  );

-- Backfill: sob a regra atual, um pouso com ICAO e sem não-conformidade
-- registrada só pode ter sido conforme (todo não-match gera OperationalEvent).
UPDATE "movement" m
SET "conformity_status" = 'CONFORMANT'
WHERE m."deleted_at" IS NULL
  AND m."operation_type" = 'LANDING'
  AND m."aerodrome" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "operational_event" oe
    WHERE oe."movement_id" = m."id"
      AND oe."type" = 'NON_CONFORMITY_NO_LANDING_REQUEST'
      AND oe."deleted_at" IS NULL
  );
