-- CreateTable
CREATE TABLE "cameras" (
    "id" UUID NOT NULL,
    "aerodrome_id" UUID NOT NULL,
    "icao" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mediamtx_node" TEXT NOT NULL,
    "mediamtx_path" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMPTZ(3),
    "deleted_by" TEXT,

    CONSTRAINT "cameras_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cameras_aerodrome_id_idx" ON "cameras"("aerodrome_id");

-- CreateIndex
CREATE INDEX "cameras_icao_idx" ON "cameras"("icao");

-- Unicidade de stream apenas entre câmeras ATIVAS: duas câmeras ativas não podem
-- repetir o trio (icao, mediamtx_node, mediamtx_path), mas um registro
-- soft-deletado (tombstone) deixa de bloquear a recriação. O Prisma não modela
-- índice parcial no schema (por isso é SQL cru aqui); a validação na escrita
-- (assertStreamUnique) reforça a mesma regra com erro 409 amigável.
CREATE UNIQUE INDEX "cameras_icao_mediamtx_node_mediamtx_path_active_key"
  ON "cameras" ("icao", "mediamtx_node", "mediamtx_path")
  WHERE "deleted_at" IS NULL;

-- AddForeignKey
ALTER TABLE "cameras" ADD CONSTRAINT "cameras_aerodrome_id_fkey" FOREIGN KEY ("aerodrome_id") REFERENCES "aerodromes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
