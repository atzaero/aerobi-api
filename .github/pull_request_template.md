## Resumo

<!-- O que mudou e porquê (1–3 frases). -->

## Issue

<!-- `Closes #N` se existir issue no projeto atzaero -->

## Tipo de mudança

- [ ] Correção de bug
- [ ] Nova funcionalidade
- [ ] Breaking change
- [ ] Apenas chore/docs/test

## Checklist

- [ ] **CI verde** no GitHub Actions (Security, Quality, Test) antes de pedir merge
- [ ] `npm run format:check`, `npm run build` e `npm run test` passam localmente (ou no container, se aplicável)
- [ ] Migrações Prisma revisadas se houver alteração em `prisma/`
- [ ] Sem segredos, `.env` ou dados sensíveis no diff

## Notas para revisores

<!-- Opcional: riscos, follow-ups, como testar. -->
