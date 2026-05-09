@AGENTS.md

## Notas Claude / Cursor específicas

- **Contexto único**: pormenores de produto, stack NestJS, camadas e fluxo de novos módulos estão em `AGENTS.md` — não duplicar aqui.
- **Comandos tipo slash**: [.claude/commands/](.claude/commands/) são a referência (`/branch`, `/commit`, `/review`, `/pr`, `/merge`, `/complete-flow`, `/scaffold-module`, …). No Cursor, [.cursor/commands/](.cursor/commands/) usa os mesmos nomes mas **só aponta** para os ficheiros em `.claude/commands/` (sem duplicar o texto) — seguir o workflow de cada um.
- **Pesquisa ampla**: em explorações grandes (vários ficheiros ou domínios), preferir delegação só de leitura (subagent Explore) ou `grep`/pesquisas focadas, para não esgotar contexto.
- **Plan mode**: usar antes de refactors estruturais grandes, mudanças em `schema.prisma` em massa, ou decisões de arquitectura que vão durar; não para edits triviais.
- **Revisão antes do PR**: invocar o agente **`code-reviewer`** ([`.claude/agents/code-reviewer.md`](.claude/agents/code-reviewer.md)) contra o checklist [`.claude/commands/review.md`](.claude/commands/review.md) e gotchas do aerobi-api (Prisma 7, `CustomHttpException`, guard, etc.).
