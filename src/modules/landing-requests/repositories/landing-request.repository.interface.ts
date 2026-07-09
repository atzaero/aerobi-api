import type {
  Prisma,
  LandingRequest,
  LandingRequestStatus,
  Uf,
} from '@/generated/prisma/client';

/**
 * Linha mínima de solicitação para agregação do dashboard. Timestamps já em ms
 * epoch (o repositório encapsula a conversão de `Date`).
 */
export interface LandingRequestDashboardRow {
  requestDateMs: number;
  reviewedAtMs: number | null;
  status: LandingRequestStatus;
}

/** Solicitação com o snapshot RAB (1:1) incluído — usado no `GET /:id`. */
export type LandingRequestWithAircraft = Prisma.LandingRequestGetPayload<{
  include: { aircraft: true };
}>;

/** Dados do snapshot RAB a gravar junto da solicitação (sem a relação). */
export type LandingRequestAircraftCreateData = Omit<
  Prisma.LandingRequestAircraftCreateInput,
  'landingRequest'
>;

/**
 * Aeródromo-alvo resolvido no create (existência + `isOpen` + derivação de
 * `icao`/`uf`). `uf` vem do grupo dono (o aeródromo não tem UF própria).
 */
export interface TargetAerodrome {
  id: string;
  icao: string;
  name: string;
  isOpen: boolean;
  groupId: string;
  uf: Uf;
}

export interface ILandingRequestRepository {
  createWithAircraft(
    data: Prisma.LandingRequestCreateInput,
    aircraft: LandingRequestAircraftCreateData | null,
  ): Promise<LandingRequest>;

  update(
    id: string,
    data: Prisma.LandingRequestUpdateInput,
  ): Promise<LandingRequest>;

  /** Atualização condicional (só se `PENDING` + ativa); retorna linhas afetadas. */
  updateIfPending(
    id: string,
    data: Prisma.LandingRequestUpdateInput,
  ): Promise<number>;

  findById(id: string): Promise<LandingRequestWithAircraft | null>;

  findMany(
    where: Prisma.LandingRequestWhereInput,
    skip: number,
    take: number,
    orderBy?: Prisma.LandingRequestOrderByWithRelationInput[],
  ): Promise<LandingRequest[]>;

  count(where: Prisma.LandingRequestWhereInput): Promise<number>;

  /**
   * Linhas mínimas para o dashboard (agregação em memória): filtradas por escopo
   * (`aerodromeIds` `null` = sem filtro; `[]` = nenhuma) e por `requestDate` no
   * intervalo `[fromMs, toMs]`.
   */
  findForDashboard(
    aerodromeIds: string[] | null,
    fromMs: number,
    toMs: number,
  ): Promise<LandingRequestDashboardRow[]>;

  /** Soft delete usando campos de auditoria deletedAt/deletedBy. */
  softDelete(id: string, deletedBy: string): Promise<LandingRequest>;

  /** Resolve o aeródromo-alvo ativo para o create público (ou `null`). */
  findTargetAerodrome(id: string): Promise<TargetAerodrome | null>;
}
