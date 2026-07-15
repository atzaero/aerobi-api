import { MaintenanceListItemResponseDTO } from '../dtos/maintenance-response.dto';
import { MaintenanceResponseDTO } from '../dtos/maintenance-response.dto';
import type { MaintenanceWithAerodrome } from '../repositories/maintenance.repository.interface';

export class MaintenanceMapper {
  static toApiRow(entity: MaintenanceWithAerodrome): MaintenanceResponseDTO {
    const row = new MaintenanceResponseDTO();
    row.id = entity.id;
    row.name = entity.name;
    row.aerodromeId = entity.aerodromeId;
    row.uf = entity.aerodrome.group.uf;
    row.securityCode = entity.securityCode;
    row.authorizedEmails = [...entity.authorizedEmails];
    row.createdAt = entity.createdAt.toISOString();
    row.updatedAt = entity.updatedAt.toISOString();
    return row;
  }

  static toListItem(
    entity: MaintenanceWithAerodrome & {
      overduePendingCount: number;
      overdueCompletedCount: number;
      uf: string;
    },
  ): MaintenanceListItemResponseDTO {
    const row = new MaintenanceListItemResponseDTO();
    row.id = entity.id;
    row.name = entity.name;
    row.aerodromeId = entity.aerodromeId;
    row.uf = entity.uf;
    row.securityCode = entity.securityCode;
    row.authorizedEmails = [...entity.authorizedEmails];
    row.createdAt = entity.createdAt.toISOString();
    row.updatedAt = entity.updatedAt.toISOString();
    row.overduePendingCount = entity.overduePendingCount;
    row.overdueCompletedCount = entity.overdueCompletedCount;
    return row;
  }

  static toListItems(
    entities: Array<
      MaintenanceWithAerodrome & {
        overduePendingCount: number;
        overdueCompletedCount: number;
        uf: string;
      }
    >,
  ): MaintenanceListItemResponseDTO[] {
    return entities.map((e) => MaintenanceMapper.toListItem(e));
  }

  static toExportRow(entity: MaintenanceWithAerodrome) {
    return {
      name: entity.name,
      aerodromeId: entity.aerodromeId,
      uf: entity.aerodrome.group.uf,
      authorizedEmails: entity.authorizedEmails,
      createdAt: entity.createdAt,
    };
  }

  static toExportRows(entities: MaintenanceWithAerodrome[]) {
    return entities.map((e) => MaintenanceMapper.toExportRow(e));
  }
}
