import { UserRole } from '@/generated/prisma/client';

import {
  PERMISSIONS,
  can,
  rolesFor,
  type AuthzAction,
  type AuthzSubject,
} from './permissions';

const ALL_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.COORDINATOR,
  UserRole.OPERATOR,
  UserRole.TECHNICAL,
];

const ALL_ACTIONS: AuthzAction[] = [
  'list',
  'read',
  'create',
  'update',
  'update-observation',
  'delete',
  'decide',
  'export',
];

/**
 * Fonte de verdade independente para o teste: espelha célula a célula a matriz
 * de `modelo-permissoes-rbac.md`. Construída à parte de `PERMISSIONS` de
 * propósito — se a implementação divergir do doc, os testes quebram.
 */
const EXPECTED: Record<
  AuthzSubject,
  Partial<Record<AuthzAction, UserRole[]>>
> = {
  group: {
    list: [UserRole.ADMIN, UserRole.COORDINATOR],
    read: [UserRole.ADMIN, UserRole.COORDINATOR],
    create: [UserRole.ADMIN],
    update: [UserRole.ADMIN],
    delete: [UserRole.ADMIN],
  },
  user: {
    list: [UserRole.ADMIN, UserRole.COORDINATOR],
    create: [UserRole.ADMIN, UserRole.COORDINATOR],
    update: [UserRole.ADMIN],
    delete: [UserRole.ADMIN, UserRole.COORDINATOR],
  },
  audit: {
    list: [UserRole.ADMIN, UserRole.COORDINATOR],
    read: [UserRole.ADMIN, UserRole.COORDINATOR],
  },
  aerodrome: {
    list: ALL_ROLES,
    read: ALL_ROLES,
    create: [UserRole.ADMIN, UserRole.COORDINATOR],
    update: [UserRole.ADMIN, UserRole.COORDINATOR],
    'update-observation': [
      UserRole.ADMIN,
      UserRole.COORDINATOR,
      UserRole.OPERATOR,
    ],
    delete: [UserRole.ADMIN],
  },
  document: {
    list: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.OPERATOR],
    read: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.OPERATOR],
    create: [UserRole.ADMIN, UserRole.COORDINATOR],
    update: [UserRole.ADMIN, UserRole.COORDINATOR],
    delete: [UserRole.ADMIN],
  },
  landing_request: {
    list: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.OPERATOR],
    read: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.OPERATOR],
    decide: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.OPERATOR],
  },
  technical_visit: {
    list: ALL_ROLES,
    read: ALL_ROLES,
    create: ALL_ROLES,
    update: ALL_ROLES,
    delete: ALL_ROLES,
    export: ALL_ROLES,
  },
  maintenance: {
    list: [UserRole.ADMIN, UserRole.COORDINATOR],
    read: [UserRole.ADMIN, UserRole.COORDINATOR],
    create: [UserRole.ADMIN, UserRole.COORDINATOR],
    update: [UserRole.ADMIN, UserRole.COORDINATOR],
    delete: [UserRole.ADMIN],
  },
  task: {
    list: [UserRole.ADMIN, UserRole.COORDINATOR],
    read: [UserRole.ADMIN, UserRole.COORDINATOR],
    create: [UserRole.ADMIN, UserRole.COORDINATOR],
    update: [UserRole.ADMIN, UserRole.COORDINATOR],
    delete: [UserRole.ADMIN],
  },
  feedback: {
    list: [UserRole.ADMIN, UserRole.COORDINATOR],
    read: [UserRole.ADMIN, UserRole.COORDINATOR],
    delete: [UserRole.ADMIN, UserRole.COORDINATOR],
  },
  rab: {
    read: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.OPERATOR],
  },
  aviascan_reading: {
    list: [UserRole.ADMIN, UserRole.COORDINATOR],
    read: [UserRole.ADMIN, UserRole.COORDINATOR],
  },
  dashboard: {
    read: ALL_ROLES,
  },
};

const ALL_SUBJECTS = Object.keys(EXPECTED) as AuthzSubject[];

describe('PERMISSIONS matrix', () => {
  it('cobre exatamente as 13 entidades esperadas', () => {
    expect(Object.keys(PERMISSIONS).sort()).toEqual([...ALL_SUBJECTS].sort());
  });

  it.each(ALL_SUBJECTS)(
    'PERMISSIONS[%s] bate com a matriz canônica',
    (subject) => {
      expect(PERMISSIONS[subject]).toEqual(EXPECTED[subject]);
    },
  );
});

describe('rolesFor', () => {
  it.each(ALL_SUBJECTS)(
    'devolve os papéis esperados para cada ação de %s',
    (subject) => {
      for (const action of ALL_ACTIONS) {
        expect(rolesFor(subject, action)).toEqual(
          EXPECTED[subject][action] ?? [],
        );
      }
    },
  );

  it('devolve [] (deny-by-default) para ação ausente', () => {
    // dashboard só tem `read`
    expect(rolesFor('dashboard', 'create')).toEqual([]);
    expect(rolesFor('rab', 'list')).toEqual([]);
    expect(rolesFor('group', 'decide')).toEqual([]);
  });
});

describe('can — matriz completa (todos subject × action × role)', () => {
  it('can() bate com a pertença à lista de rolesFor em todas as combinações', () => {
    for (const subject of ALL_SUBJECTS) {
      for (const action of ALL_ACTIONS) {
        const allowed = EXPECTED[subject][action] ?? [];
        for (const role of ALL_ROLES) {
          expect(can(role, subject, action)).toBe(allowed.includes(role));
        }
      }
    }
  });
});

describe('can — por papel (amostras-chave)', () => {
  it('ADMIN: pode tudo o que está na matriz', () => {
    expect(can(UserRole.ADMIN, 'group', 'delete')).toBe(true);
    expect(can(UserRole.ADMIN, 'aerodrome', 'delete')).toBe(true);
    expect(can(UserRole.ADMIN, 'user', 'update')).toBe(true);
    expect(can(UserRole.ADMIN, 'feedback', 'delete')).toBe(true);
  });

  it('COORDINATOR: lê grupos mas não os cria/apaga', () => {
    expect(can(UserRole.COORDINATOR, 'group', 'read')).toBe(true);
    expect(can(UserRole.COORDINATOR, 'group', 'create')).toBe(false);
    expect(can(UserRole.COORDINATOR, 'group', 'delete')).toBe(false);
    expect(can(UserRole.COORDINATOR, 'user', 'update')).toBe(false);
    expect(can(UserRole.COORDINATOR, 'aerodrome', 'delete')).toBe(false);
  });

  it('OPERATOR: decide pouso, vê documento, mas não cria aeródromo', () => {
    expect(can(UserRole.OPERATOR, 'landing_request', 'decide')).toBe(true);
    expect(can(UserRole.OPERATOR, 'aerodrome', 'update-observation')).toBe(
      true,
    );
    expect(can(UserRole.OPERATOR, 'document', 'read')).toBe(true);
    expect(can(UserRole.OPERATOR, 'rab', 'read')).toBe(true);
    expect(can(UserRole.OPERATOR, 'aerodrome', 'create')).toBe(false);
    expect(can(UserRole.OPERATOR, 'aerodrome', 'update')).toBe(false);
    expect(can(UserRole.OPERATOR, 'document', 'create')).toBe(false);
  });

  it('TECHNICAL: só visita técnica (CRUD+export), aeródromo (list/read) e dashboard', () => {
    expect(can(UserRole.TECHNICAL, 'technical_visit', 'create')).toBe(true);
    expect(can(UserRole.TECHNICAL, 'technical_visit', 'export')).toBe(true);
    expect(can(UserRole.TECHNICAL, 'technical_visit', 'delete')).toBe(true);
    expect(can(UserRole.TECHNICAL, 'aerodrome', 'read')).toBe(true);
    expect(can(UserRole.TECHNICAL, 'dashboard', 'read')).toBe(true);
    // nega tudo o resto
    expect(can(UserRole.TECHNICAL, 'aerodrome', 'update-observation')).toBe(
      false,
    );
    expect(can(UserRole.TECHNICAL, 'landing_request', 'decide')).toBe(false);
    expect(can(UserRole.TECHNICAL, 'document', 'read')).toBe(false);
    expect(can(UserRole.TECHNICAL, 'rab', 'read')).toBe(false);
    expect(can(UserRole.TECHNICAL, 'user', 'list')).toBe(false);
  });
});

describe('can — deny-by-default e entradas inválidas', () => {
  it('nega quando role é null/undefined/string vazia', () => {
    expect(can(null, 'aerodrome', 'read')).toBe(false);
    expect(can(undefined, 'aerodrome', 'read')).toBe(false);
    expect(can('', 'aerodrome', 'read')).toBe(false);
  });

  it('nega role desconhecida (não pertencente ao enum)', () => {
    expect(can('SUPERUSER', 'aerodrome', 'read')).toBe(false);
    expect(can('admin', 'aerodrome', 'read')).toBe(false); // lowercase não é o enum
  });

  it('nega ação ausente da entidade (deny-by-default)', () => {
    expect(can(UserRole.ADMIN, 'dashboard', 'delete')).toBe(false);
    expect(can(UserRole.ADMIN, 'rab', 'create')).toBe(false);
    expect(can(UserRole.ADMIN, 'audit', 'delete')).toBe(false);
  });
});
