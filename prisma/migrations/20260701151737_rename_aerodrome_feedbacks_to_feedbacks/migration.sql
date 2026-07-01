-- Renomeia o domínio `AerodromeFeedback` para `Feedback` em todo o schema.
-- O prefixo `aerodrome` era redundante: o vínculo com o aeródromo já é expresso
-- pela FK `aerodrome_id` (renomeada na migration anterior). O termo do domínio
-- (`Feedback`) permanece; apenas o prefixo cai. O enum `FeedbackRating` já não
-- tinha prefixo e não é tocado.
-- Operação puramente de rename (ALTER ... RENAME) — preserva todos os dados.
-- Tabela, PK, FK e os dois índices compostos são renomeados explicitamente para
-- manter a convenção de nomes do Prisma e evitar drift na próxima migration.

-- aerodrome_feedbacks -> feedbacks
ALTER TABLE "aerodrome_feedbacks" RENAME TO "feedbacks";
ALTER TABLE "feedbacks" RENAME CONSTRAINT "aerodrome_feedbacks_pkey" TO "feedbacks_pkey";
ALTER TABLE "feedbacks" RENAME CONSTRAINT "aerodrome_feedbacks_aerodrome_id_fkey" TO "feedbacks_aerodrome_id_fkey";
ALTER INDEX "aerodrome_feedbacks_aerodrome_id_feedback_date_idx" RENAME TO "feedbacks_aerodrome_id_feedback_date_idx";
ALTER INDEX "aerodrome_feedbacks_session_hash_aerodrome_id_feedback_date_key" RENAME TO "feedbacks_session_hash_aerodrome_id_feedback_date_key";
