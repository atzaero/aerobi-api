import { AerodromePublicResponseDTO } from '../dtos/aerodrome-public-response.dto';
import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import type {
  AerodromeVisibleWithGroup,
  AerodromeWithGroup,
} from '../repositories/aerodrome.repository.interface';

import { AerodromePublicGeojsonMapper } from './aerodrome-public-geojson.mapper';

/**
 * Projeta a entidade Prisma (com a UF do grupo carregada) no response da API.
 * A `uf` vem de `group.uf` (derivada, não é coluna do aeródromo); os campos
 * legados de URL/formatação continuam expostos para não regredir o contrato de
 * leitura, ainda que não sejam mais aceitos no create/update.
 */
export class AerodromeMapper {
  static toApiRow(entity: AerodromeWithGroup): AerodromeResponseDTO {
    const row = new AerodromeResponseDTO();
    row.id = entity.id;
    row.groupId = entity.groupId;
    row.uf = entity.group?.uf ?? null;
    row.icao = entity.icao;
    row.ciad = entity.ciad;
    row.designation = entity.designation;
    row.length = entity.length;
    row.width = entity.width;
    row.resistance = entity.resistance;
    row.surface = entity.surface;
    row.altitude = entity.altitude;
    row.name = entity.name;
    row.municipality = entity.municipality;
    row.latitude = entity.latitude;
    row.longitude = entity.longitude;
    row.latitudeFormatted = entity.latitudeFormatted;
    row.longitudeFormatted = entity.longitudeFormatted;
    row.operation = entity.operation;
    row.emergencyPhone = entity.emergencyPhone;
    row.lit = entity.lit;
    row.fueling = entity.fueling;
    row.observation = entity.observation;
    row.construction = entity.construction;
    row.isOpen = entity.isOpen;
    row.isView = entity.isView;
    row.weatherStationCode = entity.weatherStationCode;
    row.weatherStationDisplay = entity.weatherStationDisplay;
    row.fileType = entity.fileType;
    row.imgUrl = entity.imgUrl;
    row.kmlUrl = entity.kmlUrl;
    row.registrationOrdinanceUrl = entity.registrationOrdinanceUrl;
    row.planOrdinanceUrl = entity.planOrdinanceUrl;
    row.grantTermUrl = entity.grantTermUrl;
    row.aeronauticalStudyUrl = entity.aeronauticalStudyUrl;
    row.weatherUrl = entity.weatherUrl;
    row.windUrl = entity.windUrl;
    row.videoUrl = entity.videoUrl;
    row.createdAt = entity.createdAt.toISOString();
    row.createdBy = entity.createdBy;
    row.updatedAt = entity.updatedAt.toISOString();
    row.updatedBy = entity.updatedBy;
    row.deletedAt = entity.deletedAt ? entity.deletedAt.toISOString() : null;
    row.deletedBy = entity.deletedBy;
    return row;
  }

  static toApiRows(entities: AerodromeWithGroup[]): AerodromeResponseDTO[] {
    return entities.map((e) => AerodromeMapper.toApiRow(e));
  }

  /**
   * Projeção pública (mapa/ficha): omite auditoria, `emergencyPhone`, URLs de
   * documentos administrativos e `isView` (sempre true nestes endpoints).
   * Aninha o GeoJSON operacional (subset de render) ou `null`.
   */
  static toPublicApiRow(
    entity: AerodromeVisibleWithGroup,
  ): AerodromePublicResponseDTO {
    const row = new AerodromePublicResponseDTO();
    row.id = entity.id;
    row.groupId = entity.groupId;
    row.uf = entity.group?.uf ?? null;
    row.icao = entity.icao;
    row.ciad = entity.ciad;
    row.designation = entity.designation;
    row.length = entity.length;
    row.width = entity.width;
    row.resistance = entity.resistance;
    row.surface = entity.surface;
    row.altitude = entity.altitude;
    row.name = entity.name;
    row.municipality = entity.municipality;
    row.latitude = entity.latitude;
    row.longitude = entity.longitude;
    row.latitudeFormatted = entity.latitudeFormatted;
    row.longitudeFormatted = entity.longitudeFormatted;
    row.operation = entity.operation;
    row.lit = entity.lit;
    row.fueling = entity.fueling;
    row.observation = entity.observation;
    row.construction = entity.construction;
    row.isOpen = entity.isOpen;
    row.weatherStationCode = entity.weatherStationCode;
    row.weatherStationDisplay = entity.weatherStationDisplay;
    row.fileType = entity.fileType;
    row.imgUrl = entity.imgUrl;
    row.kmlUrl = entity.kmlUrl;
    row.weatherUrl = entity.weatherUrl;
    row.windUrl = entity.windUrl;
    row.videoUrl = entity.videoUrl;
    row.geojson = AerodromePublicGeojsonMapper.toPublic(entity.geojson);
    row.createdAt = entity.createdAt.toISOString();
    row.updatedAt = entity.updatedAt.toISOString();
    return row;
  }

  static toPublicApiRows(
    entities: AerodromeVisibleWithGroup[],
  ): AerodromePublicResponseDTO[] {
    return entities.map((e) => AerodromeMapper.toPublicApiRow(e));
  }
}
