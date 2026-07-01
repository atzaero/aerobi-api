# Análise de redundância — domínio operacional (Prisma)

Referência: [`prisma/schema.prisma`](../prisma/schema.prisma) (bloco a partir de `// Domínio operacional`).

Atualizado após remover da `TechnicalVisit` a cópia de dados do aeródromo (ICAO, CIAD, pista, nome, município).

## Resumo

| Modelo | Redundâncias removidas / evitadas | Campos ainda “discutíveis” |
|--------|-----------------------------------|----------------------------|
| `Group` | — | `owner_id` vs futuro `group_members` |
| `Aerodrome` | — | Nenhuma crítica; UF só no grupo |
| `LandingRequest` | `uf`, `icao`, `answer` | — |
| `TechnicalVisit` | **Removidos:** pista + ICAO/CIAD + `aerodrome_name` + `city` + `visitor_name` | Visitante: `visit_by` (uid) → `users`; cadastro do aeródromo via join |
| `PilotLanding` | — | `local_icao` / `local_name` vs `aerodrome_id` opcional |
| `Feedback` | `icao` | — |
| `Geojson` | `legacy_*` | Metadados espelham doc Firestore; vínculo é `aerodrome_id` |

## `PilotLanding`

- **`aerodrome_id`** é opcional: o legado `landings` não tem FK.
- **`local_icao`** e **`local_name`** são o que o piloto informou; podem coincidir com o aeródromo operacional resolvido na migração, mas **não são redundância pura** — são snapshot do formulário (ex.: erro de digitação, aeródromo ainda não operacional).
- **Ação futura:** se na API sempre houver FK obrigatória, avaliar se `local_*` ainda agrega valor ou só duplica.

## `TechnicalVisit` (mudança recente)

- **Antes:** mesmos campos de pista e identificação que `Aerodrome` + nome/cidade.
- **Agora:** inspeção + `visit_by` + `modifier_users` + FK. Nome do visitante via `users`, não coluna duplicada.
- **Trade-off:** PDFs/relatórios que precisem do ICAO “como na visita” devem buscar no aeródromo **atual** ou, no futuro, introduzir colunas opcionais de snapshot se o produto exigir.

## `Geojson`

- Campos como `kind`, paths de storage espelham o documento Firestore; a **fonte de verdade estrutural** é `aerodrome_id` (1:1).
- **`geo_json` opcional** quando `status = ERROR` — alinhado ao legado sem payload inline.

## `Feedback`

- Rate limit: `(session_hash, aerodrome_id, feedback_date)` — sem `icao` duplicado.

### `feedback_date` vs `created_at`

- **`feedback_date`:** dia civil (espelho do campo `date` YYYY-MM-DD no Firestore), usado na **regra de unicidade / rate limit** por sessão + aeródromo.
- **`created_at`:** **instante UTC** em que o registro foi persistido no Postgres.
- As duas colunas coexistem: o produto precisa do “dia do feedback” para limitar envios; o auditor precisa de quando o dado entrou no banco.

## `LandingRequest`: `reviewed_by` (decisão)

- No legado, `responseby` pode ser um objeto (nome, e-mail, etc.). No modelo alvo, **`reviewed_by` guarda apenas o uid** do revisor; enriquecimento com nome vem de **`users`** no futuro, evitando snapshot JSON redundante e alinhando a `visit_by`.

## `modifier_users` (`TechnicalVisit`)

- **Postgres:** `text[]` — um identificador por edição (uid Auth preferencial; import legado pode usar e-mail).
- **Firestore:** continua como array de `{ name, email, date }` até a API unificar.

## Próximas revisões sugeridas

1. Quando existir tabela **`users`**, revisar `created_by` / `reviewed_by` / `owner_id` para FKs reais vs string.
2. **`PilotLanding`:** decisão explícita sobre obrigatoriedade de `aerodrome_id` e papel de `local_icao`.
3. **Relatórios de visita técnica:** validar com negócio se o cadastro atual do aeródromo no histórico é aceitável.
