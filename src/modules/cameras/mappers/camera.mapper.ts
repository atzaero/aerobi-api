import type { Camera } from '@/generated/prisma/client';

import { CameraResponseDTO } from '../dtos/camera-response.dto';

/** Projeta a entidade Prisma `Camera` na resposta HTTP (datas → ISO string). */
export class CameraMapper {
  static toApiRow(entity: Camera): CameraResponseDTO {
    const row = new CameraResponseDTO();
    row.id = entity.id;
    row.aerodromeId = entity.aerodromeId;
    row.icao = entity.icao;
    row.name = entity.name;
    row.mediamtxNode = entity.mediamtxNode;
    row.mediamtxPath = entity.mediamtxPath;
    row.enabled = entity.enabled;
    row.createdAt = entity.createdAt.toISOString();
    row.createdBy = entity.createdBy;
    row.updatedAt = entity.updatedAt.toISOString();
    row.updatedBy = entity.updatedBy;
    row.deletedAt = entity.deletedAt ? entity.deletedAt.toISOString() : null;
    row.deletedBy = entity.deletedBy;
    return row;
  }

  static toApiRows(entities: Camera[]): CameraResponseDTO[] {
    return entities.map((e) => CameraMapper.toApiRow(e));
  }
}
