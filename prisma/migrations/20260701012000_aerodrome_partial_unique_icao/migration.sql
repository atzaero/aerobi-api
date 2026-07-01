-- Troca a unicidade TOTAL de (group_id, icao) por unicidade PARCIAL (só ativos).
-- O índice único antigo contava linhas soft-deletadas, então um ICAO excluído
-- ficava reservado para sempre e não podia ser recriado no mesmo grupo. Com o
-- índice parcial `WHERE deleted_at IS NULL`, dois aeródromos ativos ainda não
-- podem repetir o ICAO no grupo, mas um tombstone deixa de bloquear a recriação
-- (paridade com o aerobi-web/Firestore, que filtra por deleted_at IS NULL).
DROP INDEX "aerodromes_group_id_icao_key";

CREATE UNIQUE INDEX "aerodromes_group_id_icao_active_key"
  ON "aerodromes" ("group_id", "icao")
  WHERE "deleted_at" IS NULL;
