import type { OperationalAerodrome } from '@/generated/prisma/client';

import { OperationalAerodromeResponseDTO } from '../dtos/operational-aerodrome-response.dto';

export class OperationalAerodromeMapper {
  static toApiRow(
    entity: OperationalAerodrome,
  ): OperationalAerodromeResponseDTO {
    const row = new OperationalAerodromeResponseDTO();
    row.id = entity.id;
    row.groupId = entity.groupId;
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

  static toApiRows(
    entities: OperationalAerodrome[],
  ): OperationalAerodromeResponseDTO[] {
    return entities.map((e) => OperationalAerodromeMapper.toApiRow(e));
  }
}
