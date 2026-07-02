import {
  ContactMessageStatus,
  ContactType,
} from '@/generated/prisma/enums';

import type { SeedContactSpec } from '../lib/contacts';

/** Formata `Date` como chave UTC `YYYY-MM-DD` (espelha o campo `date` do contact). */
function toUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Meio-dia UTC no dia indicado — coerente com `date` na listagem. */
function noonUtc(daysAgo: number): Date {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  date.setUTCHours(12, 0, 0, 0);
  return date;
}

/** Primeiro dia do mês anterior, meio-dia UTC. */
function previousMonthNoonUtc(): Date {
  const date = new Date();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() - 1);
  date.setUTCHours(12, 0, 0, 0);
  return date;
}

/** SHA-256 hex determinístico (64 chars) para exemplos de seed. */
function seedSessionHash(index: number): string {
  const prefix = index.toString(16).padStart(8, '0');
  return `${prefix}${'0'.repeat(64)}`.slice(0, 64);
}

type ContactExampleTemplate = {
  id: string;
  email: string;
  name: string;
  phone: string;
  message: string;
  type: ContactType;
  status: ContactMessageStatus;
  sessionHash: string;
  ipHash: string;
  createdAt: Date;
  softDeleted?: boolean;
};

/**
 * Monta os exemplos de contact com datas relativas a hoje. UUIDs fixos para
 * idempotência create-only.
 */
export function buildContactSeedExamples(
  moderatorUserId: string | null,
): SeedContactSpec[] {
  const templates: ContactExampleTemplate[] = [
    {
      id: 'c0000001-0001-4001-8001-000000000001',
      email: 'ana.costa@example.com',
      name: 'Ana Costa',
      phone: '+5511987654321',
      message:
        'Gostaria de saber como consultar o histórico RAB de uma aeronave.',
      type: ContactType.question,
      status: ContactMessageStatus.pending,
      sessionHash: seedSessionHash(1),
      ipHash: 'seed-ip-001',
      createdAt: noonUtc(1),
    },
    {
      id: 'c0000002-0002-4002-8002-000000000002',
      email: 'bruno.mendes@example.com',
      name: 'Bruno Mendes',
      phone: '+5521988776655',
      message:
        'Encontrei informação desatualizada sobre um aeródromo privado no mapa.',
      type: ContactType.complaint,
      status: ContactMessageStatus.pending,
      sessionHash: seedSessionHash(2),
      ipHash: 'seed-ip-002',
      createdAt: noonUtc(3),
    },
    {
      id: 'c0000003-0003-4003-8003-000000000003',
      email: 'carla.ribeiro@example.com',
      name: 'Carla Ribeiro',
      phone: '+5531988112233',
      message:
        'Sugiro incluir filtro por estado na listagem de aeródromos operacionais.',
      type: ContactType.suggestion,
      status: ContactMessageStatus.resolved,
      sessionHash: seedSessionHash(3),
      ipHash: 'seed-ip-003',
      createdAt: noonUtc(7),
    },
    {
      id: 'c0000004-0004-4004-8004-000000000004',
      email: 'daniel.souza@example.com',
      name: 'Daniel Souza',
      phone: '+5541987445566',
      message: 'Preciso de orientação sobre integração com dados da ANAC.',
      type: ContactType.other,
      status: ContactMessageStatus.resolved,
      sessionHash: seedSessionHash(4),
      ipHash: 'seed-ip-004',
      createdAt: previousMonthNoonUtc(),
    },
    {
      id: 'c0000005-0005-4005-8005-000000000005',
      email: 'elisa.ferreira@example.com',
      name: 'Elisa Ferreira',
      phone: '+5551987332211',
      message:
        'Como faço para solicitar uma visita técnica em um aeródromo cadastrado?',
      type: ContactType.question,
      status: ContactMessageStatus.pending,
      sessionHash: seedSessionHash(5),
      ipHash: 'seed-ip-005',
      createdAt: noonUtc(14),
    },
    {
      id: 'c0000006-0006-4006-8006-000000000006',
      email: 'felipe.alves@example.com',
      name: 'Felipe Alves',
      phone: '+5561987223344',
      message: 'Recebi um e-mail de confirmação duplicado após enviar o formulário.',
      type: ContactType.complaint,
      status: ContactMessageStatus.pending,
      sessionHash: seedSessionHash(6),
      ipHash: 'seed-ip-006',
      createdAt: noonUtc(2),
      softDeleted: true,
    },
  ];

  return templates.map((template) => {
    const isModerated =
      template.status === ContactMessageStatus.resolved || template.softDeleted;
    const moderatorId = isModerated ? moderatorUserId : null;

    return {
      id: template.id,
      email: template.email,
      name: template.name,
      phone: template.phone,
      message: template.message,
      type: template.type,
      status: template.status,
      sessionHash: template.sessionHash,
      date: toUtcDateKey(template.createdAt),
      ipHash: template.ipHash,
      createdAt: template.createdAt,
      updatedAt: template.createdAt,
      createdBy: null,
      updatedBy:
        template.status === ContactMessageStatus.resolved ? moderatorId : null,
      deletedAt: template.softDeleted ? template.createdAt : null,
      deletedBy: template.softDeleted ? moderatorId : null,
    };
  });
}
