import type { Prisma, AircraftReading } from '@/generated/prisma/client';

export interface IAircraftReadingRepository {
  create(data: Prisma.AircraftReadingCreateInput): Promise<AircraftReading>;

  findById(id: string): Promise<AircraftReading | null>;

  findMany(
    where: Prisma.AircraftReadingWhereInput,
    skip: number,
    take: number,
  ): Promise<AircraftReading[]>;

  count(where: Prisma.AircraftReadingWhereInput): Promise<number>;

  /** Soft delete usando os campos de auditoria deletedAt/deletedBy. */
  softDelete(id: string, deletedBy: string): Promise<AircraftReading>;
}
