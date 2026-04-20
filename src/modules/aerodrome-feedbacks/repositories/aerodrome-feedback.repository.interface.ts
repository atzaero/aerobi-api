import type { Prisma, AerodromeFeedback } from '@/generated/prisma/client';

export interface IAerodromeFeedbackRepository {
  create(data: Prisma.AerodromeFeedbackCreateInput): Promise<AerodromeFeedback>;

  update(
    id: string,
    data: Prisma.AerodromeFeedbackUpdateInput,
  ): Promise<AerodromeFeedback>;

  findById(id: string): Promise<AerodromeFeedback | null>;

  findMany(
    where: Prisma.AerodromeFeedbackWhereInput,
    skip: number,
    take: number,
  ): Promise<AerodromeFeedback[]>;

  count(where: Prisma.AerodromeFeedbackWhereInput): Promise<number>;

  /** Soft delete usando campos de auditoria deletedAt/deletedBy. */
  softDelete(id: string, deletedBy: string): Promise<AerodromeFeedback>;
}
