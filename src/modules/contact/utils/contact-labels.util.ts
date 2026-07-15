import { ContactMessageStatus, ContactType } from '@/generated/prisma/client';

/** Rótulos pt-BR dos tipos de mensagem (espelha `aerobi-web` `CONTACT_TYPE_LABELS`). */
export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  complaint: 'Reclamação',
  question: 'Dúvida',
  suggestion: 'Sugestão',
  other: 'Outro',
};

/** Rótulos pt-BR por status (espelha `aerobi-web` `CONTACT_STATUS_LABELS`). */
export const CONTACT_STATUS_LABELS: Record<ContactMessageStatus, string> = {
  pending: 'Pendente',
  resolved: 'Resolvido',
};
