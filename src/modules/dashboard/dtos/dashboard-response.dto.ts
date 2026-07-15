import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import type { UserRole } from '@/generated/prisma/client';

/**
 * Tipos e DTOs de resposta do dashboard — fonte única de tipos do módulo
 * (espelha `aerobi-web/src/lib/dashboard.ts`). As métricas são agregados sobre os
 * módulos relacionais já migrados (`landing-requests`, `technical-visits`,
 * `aerodromes`, `feedbacks`, `tasks`), escopados por grupo e por faixa de tempo.
 *
 * A resposta é **discriminada por `meta.role`**: admin/coordinator recebem todos
 * os blocos (inclui `tasks`); operator omite `tasks`; technical recebe só
 * `technicalVisits` + `aerodromes`.
 */
export type DashboardRangePreset = '7d' | '30d' | '90d' | '12m' | 'custom';

/** Granularidade do balde de uma série temporal. */
export type RangeGranularity = 'day' | 'week' | 'month';

/** Recorte de dados aplicado server-side ao ator. */
export type DashboardScopeKind = 'all' | 'group' | 'none';

/**
 * Contagem por chave (status, rating, tipo de inspeção). Chaves em minúsculas
 * (paridade com o `aerobi-web`); chaves com contagem 0 são omitidas.
 */
export type StatusBreakdown = Record<string, number>;

/** Valor de KPI; `deltaPct` (comparação com período anterior) fica para v2. */
export class KpiValueDTO {
  @ApiProperty()
  value!: number;

  @ApiPropertyOptional()
  deltaPct?: number;
}

/** Um ponto de série temporal: `bucket` = ms epoch do início do período. */
export class TimeSeriesPointDTO {
  @ApiProperty({ description: 'ms epoch do início do balde (UTC)' })
  bucket!: number;

  @ApiProperty()
  count!: number;
}

export class TimeSeriesDTO {
  @ApiProperty({ enum: ['day', 'week', 'month'] })
  granularity!: RangeGranularity;

  @ApiProperty({ type: [TimeSeriesPointDTO] })
  points!: TimeSeriesPointDTO[];
}

export class LandingRequestsStatsDTO {
  @ApiProperty({ type: KpiValueDTO })
  total!: KpiValueDTO;

  @ApiProperty({
    description: 'Contagem por situação: `pending` / `approved` / `rejected`.',
    example: { pending: 3, approved: 5 },
  })
  byStatus!: StatusBreakdown;

  @ApiProperty({ type: TimeSeriesDTO })
  series!: TimeSeriesDTO;

  @ApiProperty({
    type: Number,
    nullable: true,
    description:
      'Tempo médio de resposta em ms (`reviewedAt − requestDate`); `null` se não houver respondidas.',
  })
  avgResponseMs!: number | null;
}

export class TechnicalVisitsStatsDTO {
  @ApiProperty({ type: KpiValueDTO })
  total!: KpiValueDTO;

  @ApiProperty({
    description:
      'Não-conformidades agregadas por item de inspeção (subconjunto curado; chaves com contagem 0 omitidas).',
    example: { sem_cerca: 2, buracos: 1 },
  })
  byInspectionType!: StatusBreakdown;

  @ApiProperty({ type: TimeSeriesDTO })
  series!: TimeSeriesDTO;
}

export class FeedbacksStatsDTO {
  @ApiProperty({ type: KpiValueDTO })
  total!: KpiValueDTO;

  @ApiProperty({
    description: 'Contagem por avaliação: `positive` / `negative`.',
    example: { positive: 8, negative: 1 },
  })
  byRating!: StatusBreakdown;
}

/** Snapshot de aeródromos (sem faixa de tempo — é estado atual). */
export class AerodromesStatsDTO {
  @ApiProperty()
  total!: number;

  @ApiProperty()
  open!: number;

  @ApiProperty()
  view!: number;

  @ApiProperty()
  construction!: number;

  @ApiProperty()
  lit!: number;

  @ApiProperty()
  fueling!: number;
}

export class TasksStatsDTO {
  @ApiProperty({ type: KpiValueDTO })
  total!: KpiValueDTO;

  @ApiProperty({
    description: 'Contagem por situação: `pending` / `completed`.',
    example: { pending: 4, completed: 6 },
  })
  byStatus!: StatusBreakdown;

  @ApiProperty({
    description:
      'Contagem por urgência: `low` / `medium` / `high` / `critical`.',
    example: { high: 2, critical: 1 },
  })
  byUrgency!: StatusBreakdown;

  @ApiProperty({ description: 'Soma de `predictedValue` das tarefas CAPEX.' })
  capexTotal!: number;

  @ApiProperty({ description: 'Soma de `predictedValue` das tarefas OPEX.' })
  opexTotal!: number;

  @ApiProperty({ description: 'Quantidade de tarefas com aviso de atraso.' })
  delayed!: number;
}

export class DashboardRangeDTO {
  @ApiProperty({ description: 'Início da faixa em ms epoch.' })
  from!: number;

  @ApiProperty({ description: 'Fim da faixa em ms epoch.' })
  to!: number;

  @ApiProperty({ enum: ['7d', '30d', '90d', '12m', 'custom'] })
  preset!: DashboardRangePreset;
}

export class DashboardMetaDTO {
  @ApiProperty({
    enum: ['ADMIN', 'COORDINATOR', 'OPERATOR', 'TECHNICAL'],
    description: 'Papel do ator (discriminador da resposta).',
  })
  role!: UserRole;

  @ApiProperty({ enum: ['all', 'group', 'none'] })
  scopeKind!: DashboardScopeKind;

  @ApiProperty({ type: DashboardRangeDTO })
  range!: DashboardRangeDTO;
}

/** Dashboard de admin/coordinator: todos os blocos (inclui `tasks`). */
export class AdminDashboardDTO {
  @ApiProperty({ type: DashboardMetaDTO })
  meta!: DashboardMetaDTO;

  @ApiProperty({ type: LandingRequestsStatsDTO })
  landingRequests!: LandingRequestsStatsDTO;

  @ApiProperty({ type: TechnicalVisitsStatsDTO })
  technicalVisits!: TechnicalVisitsStatsDTO;

  @ApiProperty({ type: AerodromesStatsDTO })
  aerodromes!: AerodromesStatsDTO;

  @ApiProperty({ type: FeedbacksStatsDTO })
  feedbacks!: FeedbacksStatsDTO;

  @ApiProperty({ type: TasksStatsDTO })
  tasks!: TasksStatsDTO;
}

/** Dashboard de operator: sem `tasks`. */
export class OperatorDashboardDTO {
  @ApiProperty({ type: DashboardMetaDTO })
  meta!: DashboardMetaDTO;

  @ApiProperty({ type: LandingRequestsStatsDTO })
  landingRequests!: LandingRequestsStatsDTO;

  @ApiProperty({ type: TechnicalVisitsStatsDTO })
  technicalVisits!: TechnicalVisitsStatsDTO;

  @ApiProperty({ type: AerodromesStatsDTO })
  aerodromes!: AerodromesStatsDTO;

  @ApiProperty({ type: FeedbacksStatsDTO })
  feedbacks!: FeedbacksStatsDTO;
}

/** Dashboard de technical: só `technicalVisits` + `aerodromes`. */
export class TechnicalDashboardDTO {
  @ApiProperty({ type: DashboardMetaDTO })
  meta!: DashboardMetaDTO;

  @ApiProperty({ type: TechnicalVisitsStatsDTO })
  technicalVisits!: TechnicalVisitsStatsDTO;

  @ApiProperty({ type: AerodromesStatsDTO })
  aerodromes!: AerodromesStatsDTO;
}

/** União discriminada por `meta.role` devolvida por `GET /dashboard`. */
export type DashboardResponseDTO =
  | AdminDashboardDTO
  | OperatorDashboardDTO
  | TechnicalDashboardDTO;
