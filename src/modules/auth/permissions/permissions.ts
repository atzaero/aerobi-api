/**
 * Política de autorização (RBAC) por entidade e ação — fonte única de "qual
 * papel pode qual ação em qual entidade" no backend. Porta a matriz canônica do
 * `aerobi-web` (`src/lib/permissions.ts`) traduzindo os papéis lowercase do
 * front para o enum Prisma `UserRole` (MAIÚSCULAS). Esta é a **fundação** do
 * RBAC: guards, services e testes consomem `can()` / `rolesFor()`.
 *
 * **Puro e portável**: sem dependências de Nest. Importável por qualquer camada.
 * Fonte canônica da política (modelo hierárquico admin → coordinator → operator
 * → técnico + matriz completa): `aerobi-web/docs/refatoracao-admin/modelo-permissoes-rbac.md`.
 *
 * **Escopo**: isto é só o gate RBAC (papel × entidade × ação). O escopo por
 * registro (ex.: coordinator só enxerga o próprio grupo) **não** vive aqui —
 * é resolvido server-side a partir do token (epic #204).
 */

import { UserRole } from '@/generated/prisma/client';

/**
 * Ação sobre uma entidade (CRUD + leitura de lista/detalhe). `update-observation`
 * é uma edição **parcial** de aeródromo (só o campo observação), liberada a mais
 * papéis que o `update` full — ver PERMISSIONS.
 */
export type AuthzAction =
  | 'list'
  | 'read'
  | 'create'
  | 'update'
  | 'update-observation'
  | 'delete'
  | 'decide' // aceitar/recusar (ex.: solicitação de pouso)
  | 'export'; // baixar/exportar (ex.: PDF de visita técnica)

/** Entidades cobertas pela política. */
export type AuthzSubject =
  | 'group'
  | 'user'
  | 'audit'
  | 'aerodrome'
  | 'document'
  | 'landing_request'
  | 'technical_visit'
  | 'maintenance'
  | 'task'
  | 'feedback'
  | 'rab'
  | 'aviascan_reading'
  | 'dashboard';

/**
 * Matriz papel × entidade × ação. Ausência de uma ação ⇒ ninguém pode
 * (deny-by-default). Espelha célula a célula a matriz do `aerobi-web`.
 */
export const PERMISSIONS: Record<
  AuthzSubject,
  Partial<Record<AuthzAction, readonly UserRole[]>>
> = {
  // Grupos: criados/editados/removidos só por admin; coordinator apenas lê.
  group: {
    list: [UserRole.ADMIN, UserRole.COORDINATOR],
    read: [UserRole.ADMIN, UserRole.COORDINATOR],
    create: [UserRole.ADMIN],
    update: [UserRole.ADMIN],
    delete: [UserRole.ADMIN],
  },
  // Usuários: admin cadastra admin/coordinator; coordinator adiciona/remove
  // operator/técnico — o recorte por **role-alvo** é validado na action, não
  // nesta matriz. `update` = reset de senha (só admin).
  user: {
    list: [UserRole.ADMIN, UserRole.COORDINATOR],
    create: [UserRole.ADMIN, UserRole.COORDINATOR],
    update: [UserRole.ADMIN],
    delete: [UserRole.ADMIN, UserRole.COORDINATOR],
  },
  // Auditoria: leitura interna (admin/coordinator).
  audit: {
    list: [UserRole.ADMIN, UserRole.COORDINATOR],
    read: [UserRole.ADMIN, UserRole.COORDINATOR],
  },
  // Aeródromos. `update` cobre os dados **e** os toggles de status (is_open,
  // is_view, weather_station_display, lit) — admin/coordinator.
  // `update-observation` é a edição parcial da observação pública (também
  // operator). `delete` = soft delete (só admin). operator **e technical** têm
  // leitura/listagem. Escopo por registro é server-side (epic #204).
  aerodrome: {
    list: [
      UserRole.ADMIN,
      UserRole.COORDINATOR,
      UserRole.OPERATOR,
      UserRole.TECHNICAL,
    ],
    read: [
      UserRole.ADMIN,
      UserRole.COORDINATOR,
      UserRole.OPERATOR,
      UserRole.TECHNICAL,
    ],
    create: [UserRole.ADMIN, UserRole.COORDINATOR],
    update: [UserRole.ADMIN, UserRole.COORDINATOR],
    'update-observation': [
      UserRole.ADMIN,
      UserRole.COORDINATOR,
      UserRole.OPERATOR,
    ],
    delete: [UserRole.ADMIN],
  },
  // Documentos do aeródromo: coordinator/admin gerenciam; operator apenas
  // visualiza; exclusão só admin.
  document: {
    list: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.OPERATOR],
    read: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.OPERATOR],
    create: [UserRole.ADMIN, UserRole.COORDINATOR],
    update: [UserRole.ADMIN, UserRole.COORDINATOR],
    delete: [UserRole.ADMIN],
  },
  // Solicitações de pouso: operator aceita/recusa (`decide`); coordinator/admin
  // herdam por hierarquia.
  landing_request: {
    list: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.OPERATOR],
    read: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.OPERATOR],
    decide: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.OPERATOR],
  },
  // Visitas técnicas: função-base do vistoriador (técnico) — adicionar, editar,
  // remover e baixar PDF (`export`); operator herda; coordinator/admin acima.
  technical_visit: {
    list: [
      UserRole.ADMIN,
      UserRole.COORDINATOR,
      UserRole.OPERATOR,
      UserRole.TECHNICAL,
    ],
    read: [
      UserRole.ADMIN,
      UserRole.COORDINATOR,
      UserRole.OPERATOR,
      UserRole.TECHNICAL,
    ],
    create: [
      UserRole.ADMIN,
      UserRole.COORDINATOR,
      UserRole.OPERATOR,
      UserRole.TECHNICAL,
    ],
    update: [
      UserRole.ADMIN,
      UserRole.COORDINATOR,
      UserRole.OPERATOR,
      UserRole.TECHNICAL,
    ],
    delete: [
      UserRole.ADMIN,
      UserRole.COORDINATOR,
      UserRole.OPERATOR,
      UserRole.TECHNICAL,
    ],
    export: [
      UserRole.ADMIN,
      UserRole.COORDINATOR,
      UserRole.OPERATOR,
      UserRole.TECHNICAL,
    ],
  },
  // Manutenção do aeródromo: gerida por coordinator/admin; exclusão só admin.
  // O acesso público de stakeholders (security_code) NÃO passa por esta matriz.
  maintenance: {
    list: [UserRole.ADMIN, UserRole.COORDINATOR],
    read: [UserRole.ADMIN, UserRole.COORDINATOR],
    create: [UserRole.ADMIN, UserRole.COORDINATOR],
    update: [UserRole.ADMIN, UserRole.COORDINATOR],
    delete: [UserRole.ADMIN],
  },
  // Tarefas da manutenção: mesma política da manutenção. Palpites públicos
  // (`guesses`) seguem o fluxo público (security_code), não esta matriz.
  task: {
    list: [UserRole.ADMIN, UserRole.COORDINATOR],
    read: [UserRole.ADMIN, UserRole.COORDINATOR],
    create: [UserRole.ADMIN, UserRole.COORDINATOR],
    update: [UserRole.ADMIN, UserRole.COORDINATOR],
    delete: [UserRole.ADMIN],
  },
  // Avaliação pública do aeródromo: o **envio** é público/anônimo e o **resumo**
  // é leitura pública; nenhum dos dois passa por esta matriz. O RBAC cobre só a
  // **moderação** interna — admin/coordinator listam e removem (soft delete).
  feedback: {
    list: [UserRole.ADMIN, UserRole.COORDINATOR],
    read: [UserRole.ADMIN, UserRole.COORDINATOR],
    delete: [UserRole.ADMIN, UserRole.COORDINATOR],
  },
  // Consulta ao RAB (ANAC) de aeronaves: operator consulta; coordinator/admin
  // acima.
  rab: {
    read: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.OPERATOR],
  },
  // Leituras de matrículas (proxy AviaScan): listagem interna restrita a
  // admin/coordinator. Somente leitura (a fonte expõe apenas `GET`).
  aviascan_reading: {
    list: [UserRole.ADMIN, UserRole.COORDINATOR],
    read: [UserRole.ADMIN, UserRole.COORDINATOR],
  },
  // Dashboard por papel: todo papel autenticado lê a sua própria dashboard. O
  // recorte de dados e o escopo por registro são resolvidos server-side. Só
  // `read` — a dashboard é somente leitura/agregação.
  dashboard: {
    read: [
      UserRole.ADMIN,
      UserRole.COORDINATOR,
      UserRole.OPERATOR,
      UserRole.TECHNICAL,
    ],
  },
};

/**
 * Papéis autorizados para `subject`/`action` (vazio ⇒ ninguém). Devolve um array
 * `readonly` — a referência aponta para a matriz interna, então mutá-la
 * corromperia a política global; o tipo impede isso em tempo de compilação.
 */
export function rolesFor(
  subject: AuthzSubject,
  action: AuthzAction,
): readonly UserRole[] {
  return PERMISSIONS[subject][action] ?? [];
}

/**
 * `true` se `role` pode executar `action` em `subject`. `null`/`undefined`,
 * string vazia ou papel fora da lista ⇒ `false` (deny-by-default).
 *
 * O tipo `UserRole | (string & {})` aceita qualquer string (defensivo contra
 * valores inesperados do token) preservando o autocomplete do enum `UserRole`.
 */
export function can(
  role: UserRole | (string & {}) | null | undefined,
  subject: AuthzSubject,
  action: AuthzAction,
): boolean {
  if (!role) return false;
  return (rolesFor(subject, action) as readonly string[]).includes(role);
}

/**
 * Matriz de permissões **já resolvida** para um papel: `{ subject: action[] }`.
 * Subjects sem nenhuma ação permitida são omitidos (deny-by-default), portanto é
 * `Partial`. Forma consumida pelo front (`GET /auth/me`) para mostrar/ocultar
 * ações sem reimplementar `can()`.
 */
export type ResolvedPermissions = Partial<Record<AuthzSubject, AuthzAction[]>>;

/**
 * Projeta a matriz `PERMISSIONS` na fatia aplicável a `role`, devolvendo só as
 * ações que `role` pode executar por entidade (via `can()`, fonte única). Itera
 * a própria matriz, então acompanha automaticamente novos subjects/ações.
 */
export function permissionsForRole(role: UserRole): ResolvedPermissions {
  const resolved: ResolvedPermissions = {};

  for (const subject of Object.keys(PERMISSIONS) as AuthzSubject[]) {
    const actions = (Object.keys(PERMISSIONS[subject]) as AuthzAction[]).filter(
      (action) => can(role, subject, action),
    );
    if (actions.length > 0) {
      resolved[subject] = actions;
    }
  }

  return resolved;
}
