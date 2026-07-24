---
name: email-templates
description: Padrão canônico do sistema de emails do aerobi-api (templates componentizados, escape por padrão, logo CID). Use ao criar/alterar um template de email, adicionar um novo fluxo que envia email, mexer em variáveis/placeholders, ou quando aparecer HTML de email fora dos componentes. Garante template composto com renderEmailLayout + átomos, registrado no registry tipado, sem escape manual de escalares no call-site.
---

# Email templates — skill (aerobi-api)

## Acionar

Ao criar/alterar email: "novo template de email", "enviar email quando X",
"mudar texto/layout do email", "placeholder", "variável do template",
"logo do email", "email não renderiza".

## Fonte

Guia completo e passo-a-passo: [`src/common/email/README.md`](../../../src/common/email/README.md). Esta skill é o resumo operacional.

## Modelo mental

- 1 template = 1 arquivo `src/common/email/templates/<nome>.template.ts` com
  `XVariables` (chaves `MAIÚSCULAS_UNDERSCORE`) + `EmailTemplateDefinition`
  composta com `renderEmailLayout` + átomos (`emailParagraph`, `emailButton`,
  `emailInfoTable`, `emailAlert`, `emailCode`).
- Registry em `templates/index.ts`: entrada em `templates` (chave snake_case) +
  em `TemplateVariables`. `EmailTemplate` é `keyof typeof templates`.
- `EmailService.send<T>` substitui `[KEY]` e **escapa por padrão**; `rawKeys`
  do template é a allowlist de HTML pré-montado (chamador escapa por dentro).
- Logo via anexo CID (`cid:aerobi-logo`) — automática, não mexer no `<img>`.
- `subject` é do call-site (listener/builder), nunca do template.

## Checklist (1 PR)

1. `<nome>.template.ts` — tipo + definição composta (copy pt-BR; eyebrow curto;
   `footerNote` para disclaimers).
2. `templates/index.ts` — registrar em `templates` **e** `TemplateVariables`.
3. `templates.spec.ts` — adicionar a `EXPECTED_PLACEHOLDERS`.
4. Call-site: injetar `EmailService` (módulo importa `EmailModule`), montar
   `variables` cru (sem `escapeHtml` em escalares).
5. `npm test && npm run lint:check && npm run format:check`.
6. Preview no Ethereal (`start:dev` loga o URL).

## Do / Don't

- **Do** compor com layout + átomos; estilos sempre inline/`<table>`.
- **Don't** escapar escalares no call-site (duplo-escape); **don't** passar HTML
  em chave fora de `rawKeys`; **don't** escrever `[MAIÚSCULAS]` literal no copy;
  **don't** logo por URL externa/data-URI; **don't** cores fora de
  `EMAIL_COLORS`/`ALERT_TONES`.
