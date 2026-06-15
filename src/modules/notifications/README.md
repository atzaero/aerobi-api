# Notifications (#304)

Notificações de movimentos via **WhatsApp** (gateway **Evolution GO**), disparadas
de forma desacoplada por `@nestjs/event-emitter`. Provisionamento do gateway:
`atzaero/aerobi-ansible` epic #137.

## Fluxo

```
movement.created (single/manual)         movements.batch.created (lote)
        │                                          │
        └──────────► MovementNotificationsListener ◄┘
                          │
                          ├─ ContactDirectoryPort  (FirestoreDirectoryPort: Firebase hoje → Postgres no futuro)
                          │     resolve grupo do aeródromo → coordenadores com telefone
                          │
                          └─ NotificationDispatchService.dispatch({ recipients, type, params })
                                   ├─ MessageBuilder (1 por NotificationType) renderiza o texto
                                   └─ WhatsappClient → EvolutionGoClient (adapter isola a API real)
```

## Decisões

- **Gatilho:** todos os movements (pouso/decolagem), single + manual + batch.
- **Batch:** um **resumo agregado por grupo** (evita uma mensagem por movimento). O
  `BatchCreateMovementService` emite `movements.batch.created`; os eventos
  `movement.created` por item continuam saindo com `batched: true` (a conformidade
  reage por item; a notificação avulsa os ignora).
- **Destinatários:** o `NotificationDispatchService` é **agnóstico** — recebe a lista
  de telefones pronta. A resolução fica na "camada de cima" (listener) via o port do
  diretório, hoje servido pelo Firebase; a migração para Postgres troca só o adapter.
- **Evolution GO atrás de interface** (`WhatsappClient`): endpoint, header de auth e
  formato de payload ficam isolados no `EvolutionGoClient`. Contrato confirmado no
  spike de provisionamento (aerobi-ansible#138 → `docs/EVOLUTION_GO.md`): envio em
  `POST /send/text`, header `apikey` = **token da instância**, body `{ number, text }`.
  Consumo **interno** na rede `warpgate` (nunca pela internet).

## Environment (Aerobi → Evolution GO)

| Var | Papel |
|-----|-------|
| `EVOLUTION_GO_BASE_URL` | base interna na warpgate (prod: `http://evolution_go:4000`) |
| `EVOLUTION_GO_API_KEY` | **token da instância** (header `apikey`); não a `GLOBAL_API_KEY` |
| `EVOLUTION_GO_AUTH_HEADER` | nome do header de auth (default `apikey`) |
| `EVOLUTION_GO_HTTP_TIMEOUT_MS` | timeout HTTP (default `8000`) |

## Estrutura

- `clients/` — `WhatsappClient` (port) + `EvolutionGoClient` (adapter) + `WhatsappSendError`.
- `services/` — `NotificationDispatchService` (genérico, tolerante a falha por destinatário).
- `builders/` — um `NotificationMessageBuilder` por `NotificationType`, registrados via `NOTIFICATION_MESSAGE_BUILDERS`.
- `listeners/` — `MovementNotificationsListener` (single + resumo de lote).
- `utils/` — normalização de telefone (E.164 ↔ JID), formatação de data, leitura de params.

## Adicionar um novo tipo de notificação

1. Acrescente um valor em `NotificationType`.
2. Crie um builder `implements NotificationMessageBuilder` (com `type` e `build`).
3. Registre-o em `NotificationsModule` (provider + factory de `NOTIFICATION_MESSAGE_BUILDERS`).
4. Faça quem dispara chamar `dispatch({ recipients, type, params })`.
