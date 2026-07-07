import { Injectable, Logger } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { EXPORT_MAX_ROWS, toCsv } from '@/common/utils/csv.util';
import { resolveOperationalActorScope } from '@/common/utils/group-scope.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { ExportMaintenancesQueryDTO } from '../dtos/export-maintenances-query.dto';
import { maintenanceExportColumns } from '../mappers/maintenance-export.columns';
import { MaintenanceMapper } from '../mappers/maintenance.mapper';
import { MaintenanceRepository } from '../repositories/maintenance.repository';
import { MaintenanceTaskRepository } from '@/modules/tasks/repositories/maintenance-task.repository';
import {
  applyOverduePendingFilter,
  buildMaintenanceScopedWhere,
} from '../utils/build-maintenance-where';
import { enrichMaintenanceListItems } from '../utils/enrich-maintenance-list';
import { MAINTENANCE_IN_MEMORY_MAX_ROWS } from '../utils/maintenance-list-limits';

export interface ExportMaintenancesResult {
  csv: string;
  truncated: boolean;
  total: number;
}

@Injectable()
export class ExportMaintenancesService {
  private readonly logger = new Logger(ExportMaintenancesService.name);

  constructor(
    private readonly repo: MaintenanceRepository,
    private readonly taskRepo: MaintenanceTaskRepository,
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    query: ExportMaintenancesQueryDTO,
    actor: AuthenticatedUser,
  ): Promise<ExportMaintenancesResult> {
    const scope = await resolveOperationalActorScope(
      actor.role,
      actor.id,
      this.userRepository,
      this.errorMessageService,
    );

    const where = buildMaintenanceScopedWhere(
      {
        name: query.name,
        aerodromeId: query.aerodromeId,
        aerodromeName: query.aerodromeName,
        uf: query.uf,
        publicAccess: query.publicAccess,
      },
      scope,
    );

    const plans = await this.repo.findMany(
      where,
      0,
      MAINTENANCE_IN_MEMORY_MAX_ROWS,
    );
    const tasks = await this.taskRepo.findTasksForMaintenanceIds(
      plans.map((p) => p.id),
    );
    let items = enrichMaintenanceListItems(plans, tasks);
    items = applyOverduePendingFilter(items, query.overduePending);
    items.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    const total = items.length;
    const truncated = total > EXPORT_MAX_ROWS;
    const slice = items.slice(0, EXPORT_MAX_ROWS);
    const rows = MaintenanceMapper.toExportRows(slice);

    if (truncated) {
      this.logger.warn(
        `Export de manutenções truncado em ${EXPORT_MAX_ROWS} de ${total} linhas.`,
      );
    }

    return {
      csv: toCsv(rows, maintenanceExportColumns),
      truncated,
      total,
    };
  }
}
