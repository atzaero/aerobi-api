/**
 * Garantia idempotente de mensagens de contact do seed — **create-only**. Se já
 * existe um registro com o `id` fixo, é no-op: o seed nunca sobrescreve status,
 * soft-delete ou qualquer alteração feita no painel.
 */
import type { PrismaClient } from '@/generated/prisma/client';
import type {
  ContactMessageStatus,
  ContactType,
} from '@/generated/prisma/enums';

/** Especificação de uma mensagem de contact a garantir. */
export type SeedContactSpec = {
  id: string;
  email: string;
  name: string;
  phone: string;
  message: string;
  type: ContactType;
  status: ContactMessageStatus;
  sessionHash: string;
  date: string;
  ipHash: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: Date | null;
  deletedBy: string | null;
};

/** `created` quando o registro foi inserido agora; `exists` quando já havia. */
export type EnsureContactResult = 'created' | 'exists';

/**
 * Cria a mensagem se ela ainda não existir (busca por `id` fixo). Já existindo,
 * retorna `exists` sem tocar no registro.
 */
export async function ensureSeedContact(
  prisma: PrismaClient,
  spec: SeedContactSpec,
): Promise<EnsureContactResult> {
  const existing = await prisma.contact.findUnique({
    where: { id: spec.id },
    select: { id: true },
  });
  if (existing) {
    return 'exists';
  }

  await prisma.contact.create({
    data: {
      id: spec.id,
      email: spec.email,
      name: spec.name,
      phone: spec.phone,
      message: spec.message,
      type: spec.type,
      status: spec.status,
      sessionHash: spec.sessionHash,
      date: spec.date,
      ipHash: spec.ipHash,
      createdAt: spec.createdAt,
      updatedAt: spec.updatedAt,
      createdBy: spec.createdBy,
      updatedBy: spec.updatedBy,
      deletedAt: spec.deletedAt,
      deletedBy: spec.deletedBy,
    },
    select: { id: true },
  });

  return 'created';
}
