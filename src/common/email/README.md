# Sistema de email — templates, componentes e envio

**Fonte canônica** de como os emails do Aerobi funcionam e de como criar/alterar
templates. Vale para desenvolvedores e para agentes de IA. Resumo operacional
para agentes: skill [`.claude/skills/email-templates/`](../../../.claude/skills/email-templates/SKILL.md).

Origem do design: sistema visual portado do `aerobi-web` (removido no
descomissionamento do Firebase — epic #577, PRs atzaero/aerobi#978/#1204).

## Arquitetura

```
src/common/email/
├── email.module.ts        # MailerModule (Ethereal em dev, SMTP MAIL_* em prod)
├── email.service.ts       # EmailService.send<T>() — renderiza, escapa, anexa logo, envia
├── assets/
│   └── aerobi-logo-email.png   # logo anexada por CID (copiada ao dist via nest-cli.json)
├── components/            # "átomos" puros de HTML (design atômico)
│   ├── email-colors.ts    # EMAIL_COLORS (paleta hex), FONT_STACK, EMAIL_LOGO_CID, ALERT_TONES
│   ├── email-components.ts# emailParagraph, emailButton, emailInfoTable, emailAlert, emailCode
│   └── email-layout.ts    # renderEmailLayout({eyebrow?, heading, contentHtml, footerNote?})
├── templates/             # 1 arquivo por template + registry
│   ├── <nome>.template.ts # tipo de variáveis + EmailTemplateDefinition composta com o layout
│   ├── email-template.types.ts  # EmailTemplateDefinition { html, rawKeys? }
│   ├── index.ts           # registry `templates`, EmailTemplate, TemplateVariables
│   └── templates.spec.ts  # contrato: placeholders de cada template × chaves esperadas
└── utils/
    ├── escape-html.util.ts    # escapeHtml (5 entidades) — compartilhado com builders
    ├── email-logo.util.ts     # getLogoAttachments (CID, cache, degradação graciosa)
    └── ethereal-logger.util.ts# preview URL no log em dev
```

## Como o envio funciona

1. O chamador injeta `EmailService` e chama
   `emailService.send({ to, subject, template: 'invite', variables: {...} })`.
   `variables` é **tipado por template** (`TemplateVariables['invite']`) — chave
   errada ou faltante vira erro de compilação.
2. `renderTemplate` substitui os placeholders `[KEY]` (regex `/\[([A-Z0-9_]+)\]/g`)
   pelos valores de `variables`, **escapando HTML por padrão** (`escapeHtml`).
   Só as chaves listadas em `rawKeys` do template passam **sem** escape — são
   blocos de HTML pré-montados pelo chamador (hoje: `DETAILS` e
   `OBSERVATION_BLOCK` de landing-requests). Variável ausente gera `warn` e o
   placeholder fica no HTML (o envio não falha).
3. O HTML de cada template já é o **documento completo** (layout base + átomos),
   composto uma única vez em module-load — coesão visual por construção.
4. `sendMail` anexa a logo da marca via `cid:aerobi-logo`
   (`getLogoAttachments`) — se o PNG faltar, loga warn 1× e envia sem logo.
5. Em `NODE_ENV=development` o transporte é Ethereal e o preview URL sai no log
   (`logEtherealPreview`).

O `subject` é responsabilidade do **call-site** (não do template) — montado no
listener/builder, com os dados já resolvidos.

## Criar um template novo (checklist)

1. **Arquivo** `src/common/email/templates/<nome>.template.ts` exportando:
   - o tipo das variáveis:
     `export type XVariables = Record<'CHAVE_A' | 'CHAVE_B', string>;`
     (chaves em `MAIÚSCULAS_COM_UNDERSCORE` — o regex só reconhece `[A-Z0-9_]`);
   - a definição composta com o layout e os átomos:

   ```ts
   export const xTemplate: EmailTemplateDefinition = {
     html: renderEmailLayout({
       eyebrow: 'Contexto curto',            // opcional, uppercase teal
       heading: 'Título do email',           // pode conter [PLACEHOLDER]
       contentHtml:
         emailParagraph('Olá [CHAVE_A],') +
         emailParagraph('Corpo com <strong>[CHAVE_B]</strong>.') +
         emailButton('Rótulo do CTA', '[URL]'),
       footerNote: 'Disclaimer opcional acima do rodapé.',
     }),
     // rawKeys: SÓ para chaves cujo valor é HTML pré-montado pelo chamador
     // rawKeys: ['BLOCO_HTML'],
   };
   ```

2. **Registrar** em `templates/index.ts`: import, entrada no objeto `templates`
   (a chave snake_case vira o nome público do template) e entrada em
   `TemplateVariables`.
3. **Contrato de teste**: adicionar a chave e o conjunto de placeholders em
   `EXPECTED_PLACEHOLDERS` de `templates/templates.spec.ts`.
4. **Call-site**: injetar `EmailService` (módulo importa `EmailModule`) e chamar
   `send` — padrão do repo é listener (`*.listener.ts`) ou builder puro que
   retorna `SendMailParams` (molde: `landing-requests/emails/`).
5. **Nunca escapar escalares no call-site** — o service escapa por padrão.
   Se o template tiver `rawKeys`, o chamador monta o bloco com os átomos e
   escapa os valores dinâmicos **dentro** dele com `escapeHtml`.
6. **Validar**: `npm test` (o `templates.spec.ts` pega placeholder divergente),
   `npm run lint:check`, `npm run format:check`.
7. **Ver o resultado**: subir `start:dev`, disparar o fluxo e abrir o preview
   URL do Ethereal logado pelo service.

## Componentes disponíveis

| Função | Uso |
|---|---|
| `renderEmailLayout({eyebrow?, heading, contentHtml, footerNote?})` | Documento completo: card 600px responsivo, barra da marca, logo CID, rodapé institucional |
| `emailParagraph(html)` | Parágrafo de corpo padrão |
| `emailButton(label, href)` | CTA sobre a cor da marca |
| `emailInfoTable(rows)` | Pares rótulo/valor (comprovantes, dados de solicitação) |
| `emailAlert(tone, html)` | Destaque com borda lateral — `success \| warning \| danger \| info` |
| `emailCode(value)` | Monospace com letter-spacing (códigos, senhas) |

Paleta/tokens em `components/email-colors.ts` — **não** introduzir cores novas
nos templates; se precisar de um tom novo, adicione ao `EMAIL_COLORS`/`ALERT_TONES`.

## Do / Don't

- **Do**: compor todo template com `renderEmailLayout` + átomos — nunca HTML de
  documento à mão num template.
- **Do**: manter todo estilo **inline** e estrutura em `<table>` (clientes de
  email não suportam `<style>` externo nem `var()`); o único `<style>` permitido
  é o do layout base (reset + media query).
- **Don't**: não usar `[TEXTO_EM_MAIÚSCULAS]` literal no copy — o regex de
  renderização captura qualquer `[A-Z0-9_]+` entre colchetes.
- **Don't**: não escapar valores escalares no call-site (duplo-escape); não
  passar HTML em chave que não esteja em `rawKeys` (chega escapado/inerte).
- **Don't**: não referenciar a logo por URL externa nem data-URI — é anexo CID.
- **Gotchas**: o ano do rodapé é avaliado em module-load (muda em restart); o
  glob de assets do `nest-cli.json` cobre só `*.png` (generalizar se precisar de
  outro formato); datas hoje chegam como ISO cru (`toISOString`) — follow-up #594.

## Variáveis de ambiente

`MAIL_HOST/PORT/SECURE/USER/PASS` (prod) e `MAIL_USER_NO_REPLY` (from padrão) —
ver `email.module.ts` e README raiz. Em dev não precisa de nada: Ethereal cria
conta efêmera e loga o preview.
