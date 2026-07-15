import type { Prisma } from '@/generated/prisma/client';

import { CreateAerodromeDTO } from '../dtos/create-aerodrome.dto';
import { AerodromeStatusField } from '../dtos/set-aerodrome-status.dto';
import { UpdateAerodromeDTO } from '../dtos/update-aerodrome.dto';

/**
 * Normaliza a observação pública: string vazia/ausente vira `null` (campo
 * limpo). Centraliza a regra do web (`value && length > 0 ? value : null`) para
 * que create, update completo e o endpoint dedicado gravem o mesmo valor.
 */
export function normalizeObservation(
  value: string | null | undefined,
): string | null {
  return value && value.length > 0 ? value : null;
}

/**
 * Monta o input de criação. `createdBy` é o ator autenticado (auditoria com ator
 * real). `isView` nasce **`false`** — o aeródromo é publicado só depois, via
 * update/set-status — espelhando o `is_view: false` hardcoded do web. Os defaults
 * dos toggles (`isOpen` true; `weatherStationDisplay`/`lit`/`fueling`/
 * `construction` false) também seguem o web. A UF **não** é persistida (derivada
 * do grupo no read).
 */
export function buildAerodromeCreateInput(
  dto: CreateAerodromeDTO,
  createdBy: string,
): Prisma.AerodromeCreateInput {
  return {
    group: { connect: { id: dto.groupId } },
    icao: dto.icao,
    name: dto.name,
    ciad: dto.ciad ?? null,
    municipality: dto.municipality ?? null,
    emergencyPhone: dto.emergencyPhone ?? null,
    latitude: dto.latitude,
    longitude: dto.longitude,
    altitude: dto.altitude,
    operation: dto.operation ?? null,
    weatherStationCode: dto.weatherStationCode ?? null,
    designation: dto.designation ?? null,
    length: dto.length ?? null,
    width: dto.width ?? null,
    resistance: dto.resistance ?? null,
    surface: dto.surface ?? null,
    observation: normalizeObservation(dto.observation),
    construction: dto.construction ?? false,
    isOpen: dto.isOpen ?? true,
    isView: false,
    weatherStationDisplay: dto.weatherStationDisplay ?? false,
    lit: dto.lit ?? false,
    fueling: dto.fueling ?? false,
    createdBy,
  };
}

/**
 * Monta o patch da **edição parcial** (semântica PATCH). Campos `undefined`
 * (ausentes no payload) viram no-op no Prisma — o padrão do repo para PATCH: só
 * o que o cliente enviou é atualizado, sem apagar/resetar o resto (nem o status
 * setado via `PATCH /:id/status`). O `group` só reconecta quando `groupId` vem
 * no payload (a checagem de escopo COORDINATOR-não-move fica no service, antes
 * deste builder); `observation` só é normalizada (vazio→null) quando enviada. A
 * UF continua derivada do grupo.
 */
export function patchAerodromeToPrisma(
  dto: UpdateAerodromeDTO,
  updatedBy: string,
): Prisma.AerodromeUpdateInput {
  return {
    group:
      dto.groupId !== undefined ? { connect: { id: dto.groupId } } : undefined,
    icao: dto.icao,
    name: dto.name,
    ciad: dto.ciad,
    municipality: dto.municipality,
    emergencyPhone: dto.emergencyPhone,
    latitude: dto.latitude,
    longitude: dto.longitude,
    altitude: dto.altitude,
    operation: dto.operation,
    weatherStationCode: dto.weatherStationCode,
    designation: dto.designation,
    length: dto.length,
    width: dto.width,
    resistance: dto.resistance,
    surface: dto.surface,
    observation:
      dto.observation !== undefined
        ? normalizeObservation(dto.observation)
        : undefined,
    construction: dto.construction,
    isOpen: dto.isOpen,
    isView: dto.isView,
    weatherStationDisplay: dto.weatherStationDisplay,
    lit: dto.lit,
    fueling: dto.fueling,
    updatedBy,
  };
}

/**
 * Patch de alternância de um único campo de status (set-status). Atualiza só o
 * campo informado + a auditoria, espelhando o `ref.update({ [field]: value })`
 * do web.
 */
export function buildAerodromeStatusPatch(
  field: AerodromeStatusField,
  value: boolean,
  updatedBy: string,
): Prisma.AerodromeUpdateInput {
  return { [field]: value, updatedBy };
}

/**
 * Patch de atualização apenas da observação. `null` limpa o campo (vazio→null é
 * resolvido no service, por paridade com o transform do web).
 */
export function buildAerodromeObservationPatch(
  observation: string | null,
  updatedBy: string,
): Prisma.AerodromeUpdateInput {
  return { observation, updatedBy };
}
