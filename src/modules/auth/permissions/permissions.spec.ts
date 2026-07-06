import { UserRole } from '@/generated/prisma/client';

import {
  PERMISSIONS,
  can,
  permissionsForRole,
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
  'edit',
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
    export: [UserRole.ADMIN, UserRole.COORDINATOR],
  },
  user: {
    list: [UserRole.ADMIN, UserRole.COORDINATOR],
    read: [UserRole.ADMIN, UserRole.COORDINATOR],
    create: [UserRole.ADMIN, UserRole.COORDINATOR],
    edit: [UserRole.ADMIN, UserRole.COORDINATOR],
    update: [UserRole.ADMIN],
    delete: [UserRole.ADMIN, UserRole.COORDINATOR],
    export: [UserRole.ADMIN, UserRole.COORDINATOR],
  },
  audit: {
    list: [UserRole.ADMIN, UserRole.COORDINATOR],
    read: [UserRole.ADMIN, UserRole.COORDINATOR],
    export: [UserRole.ADMIN, UserRole.COORDINATOR],
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
    export: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.OPERATOR],
    delete: [UserRole.ADMIN],
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
    export: [UserRole.ADMIN, UserRole.COORDINATOR],
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
    export: [UserRole.ADMIN, UserRole.COORDINATOR],
  },
  camera: {
    list: [UserRole.ADMIN, UserRole.COORDINATOR],
    read: [UserRole.ADMIN, UserRole.COORDINATOR],
    create: [UserRole.ADMIN, UserRole.COORDINATOR],
    update: [UserRole.ADMIN, UserRole.COORDINATOR],
    delete: [UserRole.ADMIN, UserRole.COORDINATOR],
  },
  contact: {
    list: [UserRole.ADMIN],
    read: [UserRole.ADMIN],
    update: [UserRole.ADMIN],
    delete: [UserRole.ADMIN],
    export: [UserRole.ADMIN],
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
  it('cobre exatamente as 15 entidades esperadas', () => {
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

  it('user: edit/read/export são admin+coordinator; update (reset) é só admin', () => {
    expect(can(UserRole.COORDINATOR, 'user', 'edit')).toBe(true);
    expect(can(UserRole.COORDINATOR, 'user', 'read')).toBe(true);
    expect(can(UserRole.COORDINATOR, 'user', 'export')).toBe(true);
    // `update` = reset de senha → só ADMIN
    expect(can(UserRole.COORDINATOR, 'user', 'update')).toBe(false);
    expect(can(UserRole.ADMIN, 'user', 'update')).toBe(true);
    // operator/technical não gerem usuários
    expect(can(UserRole.OPERATOR, 'user', 'edit')).toBe(false);
    expect(can(UserRole.TECHNICAL, 'user', 'read')).toBe(false);
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

describe('permissionsForRole — projeção da matriz por papel', () => {
  it('coincide célula a célula com can() para todos os papéis', () => {
    for (const role of ALL_ROLES) {
      const resolved = permissionsForRole(role);

      for (const subject of Object.keys(PERMISSIONS) as AuthzSubject[]) {
        for (const action of ALL_ACTIONS) {
          const allowed = resolved[subject]?.includes(action) ?? false;
          expect(allowed).toBe(can(role, subject, action));
        }
      }
    }
  });

  it('omite subjects sem nenhuma ação permitida (Partial)', () => {
    const technical = permissionsForRole(UserRole.TECHNICAL);

    // TECHNICAL não tem acesso a estes subjects ⇒ chave ausente.
    expect(technical.group).toBeUndefined();
    expect(technical.user).toBeUndefined();
    expect(technical.document).toBeUndefined();
    expect(technical.rab).toBeUndefined();
    // Mas mantém os que pode.
    expect(technical.technical_visit).toEqual([
      'list',
      'read',
      'create',
      'update',
      'delete',
      'export',
    ]);
    expect(technical.aerodrome).toEqual(['list', 'read']);
    expect(technical.dashboard).toEqual(['read']);
  });

  it('ADMIN recebe a fatia mais ampla (ex.: delete de aeródromo e user.update)', () => {
    const admin = permissionsForRole(UserRole.ADMIN);

    expect(admin.aerodrome).toContain('delete');
    expect(admin.user).toContain('update');
    expect(admin.feedback).toContain('delete');
  });

  it('OPERATOR: decide pouso e edita observação, mas sem create/update full de aeródromo', () => {
    const operator = permissionsForRole(UserRole.OPERATOR);

    expect(operator.landing_request).toContain('decide');
    expect(operator.aerodrome).toContain('update-observation');
    expect(operator.aerodrome).not.toContain('create');
    expect(operator.aerodrome).not.toContain('update');
  });

  it('preserva a ordem de declaração das ações na matriz', () => {
    // A iteração segue Object.keys(PERMISSIONS[subject]) ⇒ ordem de inserção.
    expect(permissionsForRole(UserRole.ADMIN).group).toEqual([
      'list',
      'read',
      'create',
      'update',
      'delete',
      'export',
    ]);
  });
});
