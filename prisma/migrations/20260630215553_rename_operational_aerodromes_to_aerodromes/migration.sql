-- Renomeia o domínio `OperationalAerodrome` para `Aerodrome` em todo o schema.
-- O cadastro próprio da Aerobi (ex-Firestore) é distinto dos datasets de consulta
-- da ANAC (`public_aerodrome` / `private_aerodrome`), por isso o prefixo `operational`
-- deixa de ser necessário.
-- Operação puramente de rename (ALTER ... RENAME) — preserva todos os dados.
-- Tabelas, colunas, índices e constraints são renomeados explicitamente para
-- manter a convenção de nomes do Prisma e evitar drift na próxima migration.

-- operational_aerodromes -> aerodromes
ALTER TABLE "operational_aerodromes" RENAME TO "aerodromes";
ALTER TABLE "aerodromes" RENAME CONSTRAINT "operational_aerodromes_pkey" TO "aerodromes_pkey";
ALTER TABLE "aerodromes" RENAME CONSTRAINT "operational_aerodromes_group_id_fkey" TO "aerodromes_group_id_fkey";
ALTER INDEX "operational_aerodromes_group_id_idx" RENAME TO "aerodromes_group_id_idx";
ALTER INDEX "operational_aerodromes_icao_is_view_idx" RENAME TO "aerodromes_icao_is_view_idx";
ALTER INDEX "operational_aerodromes_group_id_icao_key" RENAME TO "aerodromes_group_id_icao_key";

-- landing_requests.operational_aerodrome_id -> aerodrome_id
ALTER TABLE "landing_requests" RENAME COLUMN "operational_aerodrome_id" TO "aerodrome_id";
ALTER TABLE "landing_requests" RENAME CONSTRAINT "landing_requests_operational_aerodrome_id_fkey" TO "landing_requests_aerodrome_id_fkey";
ALTER INDEX "landing_requests_operational_aerodrome_id_status_idx" RENAME TO "landing_requests_aerodrome_id_status_idx";
ALTER INDEX "landing_requests_operational_aerodrome_id_request_date_idx" RENAME TO "landing_requests_aerodrome_id_request_date_idx";

-- technical_visits.operational_aerodrome_id -> aerodrome_id
ALTER TABLE "technical_visits" RENAME COLUMN "operational_aerodrome_id" TO "aerodrome_id";
ALTER TABLE "technical_visits" RENAME CONSTRAINT "technical_visits_operational_aerodrome_id_fkey" TO "technical_visits_aerodrome_id_fkey";
ALTER INDEX "technical_visits_operational_aerodrome_id_visit_at_idx" RENAME TO "technical_visits_aerodrome_id_visit_at_idx";

-- aerodrome_geojsons.operational_aerodrome_id -> aerodrome_id
ALTER TABLE "aerodrome_geojsons" RENAME COLUMN "operational_aerodrome_id" TO "aerodrome_id";
ALTER TABLE "aerodrome_geojsons" RENAME CONSTRAINT "aerodrome_geojsons_operational_aerodrome_id_fkey" TO "aerodrome_geojsons_aerodrome_id_fkey";
ALTER INDEX "aerodrome_geojsons_operational_aerodrome_id_key" RENAME TO "aerodrome_geojsons_aerodrome_id_key";

-- aerodrome_feedbacks.operational_aerodrome_id -> aerodrome_id
ALTER TABLE "aerodrome_feedbacks" RENAME COLUMN "operational_aerodrome_id" TO "aerodrome_id";
ALTER TABLE "aerodrome_feedbacks" RENAME CONSTRAINT "aerodrome_feedbacks_operational_aerodrome_id_fkey" TO "aerodrome_feedbacks_aerodrome_id_fkey";
ALTER INDEX "aerodrome_feedbacks_operational_aerodrome_id_feedback_date_idx" RENAME TO "aerodrome_feedbacks_aerodrome_id_feedback_date_idx";
ALTER INDEX "aerodrome_feedbacks_session_hash_operational_aerodrome_id_f_key" RENAME TO "aerodrome_feedbacks_session_hash_aerodrome_id_feedback_date_key";

-- pilot_landings.operational_aerodrome_id -> aerodrome_id
ALTER TABLE "pilot_landings" RENAME COLUMN "operational_aerodrome_id" TO "aerodrome_id";
ALTER TABLE "pilot_landings" RENAME CONSTRAINT "pilot_landings_operational_aerodrome_id_fkey" TO "pilot_landings_aerodrome_id_fkey";
ALTER INDEX "pilot_landings_operational_aerodrome_id_idx" RENAME TO "pilot_landings_aerodrome_id_idx";
