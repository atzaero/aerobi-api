import type {
  Movement,
  MovementAircraftSnapshot,
} from '@/generated/prisma/client';

import { MovementAircraftSnapshotResponseDTO } from '../dtos/movement-aircraft-snapshot-response.dto';
import { MovementResponseDTO } from '../dtos/movement-response.dto';
import { parseOperadores, parseProprietarios } from '../utils/parse-rab-people';

/** Entidade `Movement` com a relação 1:1 `aircraftSnapshot` carregada via `include`. */
export type MovementWithSnapshot = Movement & {
  aircraftSnapshot: MovementAircraftSnapshot | null;
};

/**
 * Projeta a entidade em DTO de resposta (camelCase). A `imageUrl` (presigned) é
 * resolvida no service e injetada aqui — o mapper permanece síncrono/testável.
 */
export class MovementMapper {
  static toApiRow(
    entity: MovementWithSnapshot,
    imageUrl: string | null,
  ): MovementResponseDTO {
    const row = new MovementResponseDTO();
    row.id = entity.id;
    row.registration = entity.registration;
    row.operationType = entity.operationType;
    row.source = entity.source;
    row.readingDatetime = entity.readingDatetime.toISOString();
    row.readingStatus = entity.readingStatus;
    row.revisorId = entity.revisorId;
    row.imageUrl = imageUrl;
    row.comments = entity.comments;
    row.aerodrome = entity.aerodrome;
    row.conformityStatus = entity.conformityStatus;
    row.aircraftSnapshot = MovementMapper.toSnapshot(entity.aircraftSnapshot);
    row.createdAt = entity.createdAt.toISOString();
    row.updatedAt = entity.updatedAt.toISOString();
    return row;
  }

  private static toSnapshot(
    snapshot: MovementAircraftSnapshot | null,
  ): MovementAircraftSnapshotResponseDTO | null {
    if (!snapshot) {
      return null;
    }
    const dto = new MovementAircraftSnapshotResponseDTO();
    dto.rabRowId = snapshot.rabRowId;
    dto.rabPeriod = snapshot.rabPeriod;
    dto.marcas = snapshot.marcas;
    dto.proprietarios = parseProprietarios(snapshot.proprietarios);
    dto.operadores = parseOperadores(snapshot.operadores);
    dto.nrSerie = snapshot.nrSerie;
    dto.dsModelo = snapshot.dsModelo;
    dto.nmFabricante = snapshot.nmFabricante;
    dto.cdTipoIcao = snapshot.cdTipoIcao;
    dto.nrPmd = snapshot.nrPmd;
    dto.nrAssentos = snapshot.nrAssentos;
    dto.nrAnoFabricacao = snapshot.nrAnoFabricacao;
    dto.tpMotor = snapshot.tpMotor;
    dto.qtMotor = snapshot.qtMotor;
    dto.cfOperacional = snapshot.cfOperacional;
    dto.tpOperacao = snapshot.tpOperacao;
    dto.createdAt = snapshot.createdAt.toISOString();
    return dto;
  }
}
