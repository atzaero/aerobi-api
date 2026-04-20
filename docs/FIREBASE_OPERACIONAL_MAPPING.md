# Mapeamento Firestore (operacional) ↔ Prisma / modelo relacional

Referência para migração. Caminhos legados vs tabelas [`schema.prisma`](../prisma/schema.prisma) (bloco domínio operacional).

Análise contínua de colunas redundantes: [`OPERACIONAL_ANALISE_REDUNDANCIA.md`](./OPERACIONAL_ANALISE_REDUNDANCIA.md).

## Contrato alinhado (monorepo)

O front e o script de preview seguem o mesmo contrato de dados que este repositório:

- Tipos e shapes de domínio: [`aerobi-web/docs/data-model/model.ts`](../../aerobi-web/docs/data-model/model.ts)
- Shadow / paridade Firestore → Postgres (dry-run): [`aerobi-web/scripts/firestore-shadow-migration.ts`](../../aerobi-web/scripts/firestore-shadow-migration.ts)

## Migrações (DDL)

A **fonte de verdade** do esquema relacional é [`schema.prisma`](../prisma/schema.prisma); o SQL aplicado ao banco é o conteúdo ordenado em [`prisma/migrations/`](../prisma/migrations/) (uma pasta por revisão).

- Desenvolvimento: `npm run prisma:migrate` (`prisma migrate dev`)
- CI / produção: `npm run prisma:deploy` (`prisma migrate deploy`)

## Coleções / paths → modelos

| Firestore | Modelo Prisma | Tabela SQL |
|-----------|-----------------|------------|
| `states/{uf}/groups/{groupId}` | `AerodromeGroup` | `aerodrome_groups` |
| `states/.../aerodromes/{id}` | `OperationalAerodrome` | `operational_aerodromes` |
| `.../awaitemails` + `.../answeredemails` | `LandingRequest` | `landing_requests` |
| `.../technicalVisit` | `TechnicalVisit` | `technical_visits` |
| `landings` (raiz) | `PilotLanding` | `pilot_landings` |
| `.../aerodromes/.../feedbacks` | `AerodromeFeedback` | `aerodrome_feedbacks` |
| `geojsons` (raiz) | `AerodromeGeojson` | `aerodrome_geojsons` |

Não modelado como tabela operacional: `stateList/list`, `PI`, `admID`, coleção `users` (proposta futura).

## Decisões de colunas (alvo Postgres)

- **UF** apenas em `AerodromeGroup.uf`. Demais entidades obtêm UF via join (`operational_aerodromes.group_id` → `aerodrome_groups`).
- **`LandingRequest`:** sem `uf`, `icao`, `answer`; só `status` (`PENDING` / `APPROVED` / `REJECTED`). ICAO via `operational_aerodrome_id`.
- **`reviewed_by` / `reviewed_at`:** no alvo, **uid** em coluna (`reviewed_by`), não JSON com nome/e-mail/role. O legado pode trazer objeto em `responseby`; na importação extrair o uid (ex. `responseby.uid`). Nome e perfil vêm da futura tabela `users` — mesma linha de `visit_by` em `TechnicalVisit`.
- **`AerodromeFeedback`:** sem `icao`; rate limit único em `(session_hash, operational_aerodrome_id, feedback_date)`. Ver também `feedback_date` vs `created_at` em [`OPERACIONAL_ANALISE_REDUNDANCIA.md`](./OPERACIONAL_ANALISE_REDUNDANCIA.md).
- **`AerodromeGeojson`:** sem `legacy_state_id` / `legacy_icao`; `geo_json` opcional (`jsonb`) para linhas `ERROR`.
- **`PilotLanding`:** `landing_at` (`timestamptz`), não `landing_date` string.
- **Auditoria “quem criou”:** coluna `created_by`, campo Prisma `createdBy`.
- **`TechnicalVisit`:** sem cópia de ICAO/CIAD/pista nem `aerodrome_name`/`city`; visitante = `visit_by` (uid) → futura tabela `users` — não `visitor_name`. Legado: `VISITORNAME` no Firestore até a API gravar uid.

## Campos legados Firestore → colunas alvo (amostra)

| Legado | Alvo |
|--------|------|
| `responseDate` / `responseby` | `reviewed_at`, `reviewed_by` (uid Auth; ex. `responseby.uid`) |
| `answer` (boolean) | derivar `status` na migração |
| `requestDate` | `request_date` |
| `date` (landings) | parse → `landing_at` |
| `sessionHash` + `icao` + `date` (feedback) | `session_hash` + `operational_aerodrome_id` + `feedback_date` (`date` YYYY-MM-DD no Firestore = dia civil do rate limit; `created_at` = instante de gravação no Postgres) |
| `VISITORNAME` (legado) | `visit_by` (uid; import pode null até backfill / app gravar uid) |
| `MODIFIERUSERS` (objetos `{ email, … }`) | `modifier_users` `TEXT[]` (uid se houver, senão e-mail, ordem preservada) |

Para chaves e nomes UPPERCASE em aeródromos/visitas, ver [REVISAO-PROPOSTA-VS-ATUAL.md](../../aerobi-web/docs/data-model/REVISAO-PROPOSTA-VS-ATUAL.md).
