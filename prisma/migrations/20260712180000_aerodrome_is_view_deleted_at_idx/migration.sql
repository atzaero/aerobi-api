-- Índice para GET /aerodromes/visible (mapa): filtra is_view + deleted_at
-- sem depender do líder `icao` de aerodromes_icao_is_view_idx.
CREATE INDEX "aerodromes_is_view_deleted_at_idx" ON "aerodromes"("is_view", "deleted_at");
