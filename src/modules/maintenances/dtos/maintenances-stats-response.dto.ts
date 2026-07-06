import { ApiProperty } from '@nestjs/swagger';

/** Contagem por urgência (chaves lowercase). */
export type StatusBreakdown = Partial<
  Record<'low' | 'medium' | 'high' | 'critical', number>
>;

/**
 * Snapshot agregado do minidashboard `/maintenances`.
 */
export class MaintenancesStatsResponseDTO {
  @ApiProperty()
  meta!: { scopeKind: 'all' | 'group' | 'none' };

  @ApiProperty()
  aerodromesRegistered!: number;

  @ApiProperty()
  aerodromesWithMaintenance!: number;

  @ApiProperty()
  investmentTypePercent!: { capex: number; opex: number; unknown: number };

  @ApiProperty()
  predictedValueByInvestmentType!: { capex: number; opex: number };

  @ApiProperty()
  totalPredictedValue!: number;

  @ApiProperty()
  overduePending!: number;

  @ApiProperty()
  overdueCompleted!: number;

  @ApiProperty()
  byUrgency!: StatusBreakdown;

  @ApiProperty()
  tasksByAerodrome!: Record<string, number>;
}
