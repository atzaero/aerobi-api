import type { Prisma } from '@/generated/prisma/client';

import { CreateOperationalAerodromeDTO } from '../dtos/create-operational-aerodrome.dto';
import { UpdateOperationalAerodromeDTO } from '../dtos/update-operational-aerodrome.dto';

export function buildOperationalAerodromeCreateInput(
  dto: CreateOperationalAerodromeDTO,
): Prisma.OperationalAerodromeCreateInput {
  const { groupId, ...fields } = dto;
  return {
    ...fields,
    group: { connect: { id: groupId } },
  };
}

export function patchOperationalAerodromeToPrisma(
  dto: UpdateOperationalAerodromeDTO,
): Prisma.OperationalAerodromeUpdateInput {
  const data: Prisma.OperationalAerodromeUpdateInput = {};
  if (dto.icao !== undefined) data.icao = dto.icao;
  if (dto.ciad !== undefined) data.ciad = dto.ciad;
  if (dto.designation !== undefined) data.designation = dto.designation;
  if (dto.length !== undefined) data.length = dto.length;
  if (dto.width !== undefined) data.width = dto.width;
  if (dto.resistance !== undefined) data.resistance = dto.resistance;
  if (dto.surface !== undefined) data.surface = dto.surface;
  if (dto.altitude !== undefined) data.altitude = dto.altitude;
  if (dto.name !== undefined) data.name = dto.name;
  if (dto.municipality !== undefined) data.municipality = dto.municipality;
  if (dto.latitude !== undefined) data.latitude = dto.latitude;
  if (dto.longitude !== undefined) data.longitude = dto.longitude;
  if (dto.latitudeFormatted !== undefined) {
    data.latitudeFormatted = dto.latitudeFormatted;
  }
  if (dto.longitudeFormatted !== undefined) {
    data.longitudeFormatted = dto.longitudeFormatted;
  }
  if (dto.operation !== undefined) data.operation = dto.operation;
  if (dto.lit !== undefined) data.lit = dto.lit;
  if (dto.fueling !== undefined) data.fueling = dto.fueling;
  if (dto.observation !== undefined) data.observation = dto.observation;
  if (dto.construction !== undefined) data.construction = dto.construction;
  if (dto.isOpen !== undefined) data.isOpen = dto.isOpen;
  if (dto.isView !== undefined) data.isView = dto.isView;
  if (dto.weatherStationCode !== undefined) {
    data.weatherStationCode = dto.weatherStationCode;
  }
  if (dto.weatherStationDisplay !== undefined) {
    data.weatherStationDisplay = dto.weatherStationDisplay;
  }
  if (dto.fileType !== undefined) data.fileType = dto.fileType;
  if (dto.imgUrl !== undefined) data.imgUrl = dto.imgUrl;
  if (dto.kmlUrl !== undefined) data.kmlUrl = dto.kmlUrl;
  if (dto.registrationOrdinanceUrl !== undefined) {
    data.registrationOrdinanceUrl = dto.registrationOrdinanceUrl;
  }
  if (dto.planOrdinanceUrl !== undefined) {
    data.planOrdinanceUrl = dto.planOrdinanceUrl;
  }
  if (dto.grantTermUrl !== undefined) data.grantTermUrl = dto.grantTermUrl;
  if (dto.aeronauticalStudyUrl !== undefined) {
    data.aeronauticalStudyUrl = dto.aeronauticalStudyUrl;
  }
  if (dto.weatherUrl !== undefined) data.weatherUrl = dto.weatherUrl;
  if (dto.windUrl !== undefined) data.windUrl = dto.windUrl;
  if (dto.videoUrl !== undefined) data.videoUrl = dto.videoUrl;
  return data;
}
