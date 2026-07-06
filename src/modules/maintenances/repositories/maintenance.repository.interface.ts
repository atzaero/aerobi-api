import type {
  Aerodrome,
  Group,
  Maintenance,
  Prisma,
} from '@/generated/prisma/client';

export type MaintenanceWithAerodrome = Maintenance & {
  aerodrome: Aerodrome & { group: Pick<Group, 'uf'> };
};

export interface IMaintenanceRepository {
  create(data: Prisma.MaintenanceCreateInput): Promise<Maintenance>;
  update(id: string, data: Prisma.MaintenanceUpdateInput): Promise<Maintenance>;
  findById(id: string): Promise<MaintenanceWithAerodrome | null>;
  findMany(
    where: Prisma.MaintenanceWhereInput,
    skip?: number,
    take?: number,
  ): Promise<MaintenanceWithAerodrome[]>;
  count(where: Prisma.MaintenanceWhereInput): Promise<number>;
  findActiveAerodrome(
    aerodromeId: string,
  ): Promise<(Aerodrome & { group: Pick<Group, 'uf' | 'id'> }) | null>;
  findAerodromeInvitationLabel(
    aerodromeId: string,
  ): Promise<{ name: string; icao: string | null } | null>;
  countActiveAerodromes(scope: { groupId?: string }): Promise<number>;
  findActiveAerodromeIds(scope: { groupId?: string }): Promise<string[]>;
  softDeleteWithTasks(
    id: string,
    actorId: string,
  ): Promise<{ maintenance: Maintenance; deletedTasks: number }>;
}
