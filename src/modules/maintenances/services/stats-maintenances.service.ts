import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resolveActorGroupScope } from '@/common/utils/group-scope.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { MaintenancesStatsResponseDTO } from '../dtos/maintenances-stats-response.dto';
import { decimalToNumber } from '../mappers/maintenance-export.columns';
import { aggregateMaintenancesDashboard } from '../mappers/stats-aggregate.util';
import { MaintenanceRepository } from '../repositories/maintenance.repository';
import { MaintenanceTaskRepository } from '@/modules/tasks/repositories/maintenance-task.repository';
import { buildMaintenanceScopedWhere } from '../utils/build-maintenance-where';
import { MAINTENANCE_IN_MEMORY_MAX_ROWS } from '../utils/maintenance-list-limits';

@Injectable()
export class StatsMaintenancesService {
  constructor(
    private readonly repo: MaintenanceRepository,
    private readonly taskRepo: MaintenanceTaskRepository,
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  /**
   * Agrega indicadores do minidashboard no escopo do ator. Carrega até
   * `MAINTENANCE_IN_MEMORY_MAX_ROWS` intervenções — datasets maiores exigiriam
   * agregação SQL dedicada.
   */
  async execute(
    actor: AuthenticatedUser,
  ): Promise<MaintenancesStatsResponseDTO> {
    const scope = await resolveActorGroupScope(
      actor.role,
      actor.id,
      this.userRepository,
      this.errorMessageService,
    );

    const scopeKind = scope.kind;
    if (scopeKind === 'none') {
      return aggregateMaintenancesDashboard({
        scopeKind: 'none',
        aerodromesRegistered: 0,
        maintenances: [],
        tasks: [],
      });
    }

    const aerodromeScope =
      scope.kind === 'group' ? { groupId: scope.groupId } : {};
    const aerodromesRegistered =
      await this.repo.countActiveAerodromes(aerodromeScope);

    const maintenanceWhere = buildMaintenanceScopedWhere({}, scope);
    const maintenances = await this.repo.findMany(
      maintenanceWhere,
      0,
      MAINTENANCE_IN_MEMORY_MAX_ROWS,
    );

    const aerodromeIds =
      scope.kind === 'group'
        ? await this.repo.findActiveAerodromeIds({ groupId: scope.groupId })
        : null;

    const rawTasks = await this.taskRepo.findTasksForStats(aerodromeIds);
    const tasks = rawTasks.map((task) => ({
      ...task,
      predictedValue: decimalToNumber(task.predictedValue),
    }));

    return aggregateMaintenancesDashboard({
      scopeKind,
      aerodromesRegistered,
      maintenances,
      tasks,
    });
  }
}
