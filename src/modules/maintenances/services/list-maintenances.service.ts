import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resolveOperationalActorScope } from '@/common/utils/group-scope.util';
import { resolvePaginationParams } from '@/common/utils/pagination-params.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { ListMaintenancesQueryDTO } from '../dtos/list-maintenances-query.dto';
import { MaintenancesPaginatedResponseDTO } from '../dtos/maintenances-paginated-response.dto';
import { MaintenanceMapper } from '../mappers/maintenance.mapper';
import { MaintenanceRepository } from '../repositories/maintenance.repository';
import { MaintenanceTaskRepository } from '@/modules/tasks/repositories/maintenance-task.repository';
import {
  applyOverduePendingFilter,
  buildMaintenanceScopedWhere,
} from '../utils/build-maintenance-where';
import { enrichMaintenanceListItems } from '../utils/enrich-maintenance-list';
import { MAINTENANCE_IN_MEMORY_MAX_ROWS } from '../utils/maintenance-list-limits';

const MAX_LIMIT = 200;

@Injectable()
export class ListMaintenancesService {
  constructor(
    private readonly repo: MaintenanceRepository,
    private readonly taskRepo: MaintenanceTaskRepository,
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    query: ListMaintenancesQueryDTO,
    actor: AuthenticatedUser,
  ): Promise<MaintenancesPaginatedResponseDTO> {
    const { page, limit } = resolvePaginationParams(query, MAX_LIMIT);

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
    const pageData = items.slice((page - 1) * limit, page * limit);

    return new MaintenancesPaginatedResponseDTO(
      MaintenanceMapper.toListItems(pageData),
      page,
      limit,
      total,
    );
  }
}
