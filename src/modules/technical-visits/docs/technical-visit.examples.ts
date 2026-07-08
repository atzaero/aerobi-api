import {
  AERODROME_EXAMPLE_FULL,
  AERODROME_EXAMPLE_MIN_OPERATIONAL,
} from '@/modules/aerodromes/docs/aerodrome-request.examples';

/** Mesmo `id` de exemplo do `AerodromeResponseDTO` (módulo aeródromos). */
export const TECHNICAL_VISIT_EXAMPLE_AERODROME_ID =
  '9f1e2d3c-4b5a-4c6d-8e7f-0a1b2c3d4e5f';

export const TECHNICAL_VISIT_EXAMPLE_VISIT_ID =
  '550e8400-e29b-41d4-a716-446655440000';

export const TECHNICAL_VISIT_EXAMPLE_ACTOR_ID =
  '33333333-3333-4333-8333-333333333333';

/** UF do grupo do aeródromo de exemplo (`SBSP` / São Paulo). */
export const TECHNICAL_VISIT_EXAMPLE_UF = 'SP';

export const TECHNICAL_VISIT_EXAMPLE_ICAO = AERODROME_EXAMPLE_FULL.icao;

export const TECHNICAL_VISIT_EXAMPLE_AERODROME_NAME =
  AERODROME_EXAMPLE_FULL.name;

export const TECHNICAL_VISIT_EXAMPLE_CITY = AERODROME_EXAMPLE_FULL.municipality;

export const TECHNICAL_VISIT_EXAMPLE_CIAD = AERODROME_EXAMPLE_FULL.ciad;

export const TECHNICAL_VISIT_EXAMPLE_DESIGNATION =
  AERODROME_EXAMPLE_FULL.designation;

export const TECHNICAL_VISIT_EXAMPLE_LENGTH = AERODROME_EXAMPLE_FULL.length;

export const TECHNICAL_VISIT_EXAMPLE_WIDTH = AERODROME_EXAMPLE_FULL.width;

export const TECHNICAL_VISIT_EXAMPLE_RESISTANCE =
  AERODROME_EXAMPLE_FULL.resistance;

export const TECHNICAL_VISIT_EXAMPLE_SURFACE = AERODROME_EXAMPLE_FULL.surface;

export const TECHNICAL_VISIT_EXAMPLE_ALTITUDE = AERODROME_EXAMPLE_FULL.altitude;

const RUNWAY_SNAPSHOT = {
  ciad: TECHNICAL_VISIT_EXAMPLE_CIAD,
  designation: TECHNICAL_VISIT_EXAMPLE_DESIGNATION,
  length: TECHNICAL_VISIT_EXAMPLE_LENGTH,
  width: TECHNICAL_VISIT_EXAMPLE_WIDTH,
  resistance: TECHNICAL_VISIT_EXAMPLE_RESISTANCE,
  surface: TECHNICAL_VISIT_EXAMPLE_SURFACE,
  altitude: TECHNICAL_VISIT_EXAMPLE_ALTITUDE,
} as const;

const VISIT_AT = '2024-06-01T09:00:00.000Z';

const INSPECTION_DEFAULTS = {
  hasGatesPadlocks: true,
  hasFence: true,
  hasStandardPlate: true,
  hasQualityHoles: false,
  hasQualityAsphalt: false,
  hasQualityOthers: false,
  hasHorizontalSignage: true,
  hasUnobstructedHeadboards: true,
  hasTrackRange: true,
  pavementRegularity: true,
  hasTrashDebris: false,
  hasDelimitedPerimeter: true,
  hasInvasion: false,
} as const;

/** Payload completo — snapshot de pista alinhado a `AERODROME_EXAMPLE_FULL`. */
export const TECHNICAL_VISIT_CREATE_EXAMPLE = {
  aerodromeId: TECHNICAL_VISIT_EXAMPLE_AERODROME_ID,
  visitorName: 'João Silva',
  city: TECHNICAL_VISIT_EXAMPLE_CITY,
  ...RUNWAY_SNAPSHOT,
  visitAt: VISIT_AT,
  ...INSPECTION_DEFAULTS,
};

/** Payload mínimo com pista — alinhado a `AERODROME_EXAMPLE_MIN_OPERATIONAL`. */
export const TECHNICAL_VISIT_CREATE_EXAMPLE_MIN_OPERATIONAL = {
  aerodromeId: TECHNICAL_VISIT_EXAMPLE_AERODROME_ID,
  visitorName: 'João Silva',
  city: TECHNICAL_VISIT_EXAMPLE_CITY,
  designation: AERODROME_EXAMPLE_MIN_OPERATIONAL.designation,
  length: AERODROME_EXAMPLE_MIN_OPERATIONAL.length,
  width: AERODROME_EXAMPLE_MIN_OPERATIONAL.width,
  resistance: AERODROME_EXAMPLE_MIN_OPERATIONAL.resistance,
  surface: AERODROME_EXAMPLE_MIN_OPERATIONAL.surface,
  altitude: AERODROME_EXAMPLE_MIN_OPERATIONAL.altitude,
  visitAt: VISIT_AT,
  ...INSPECTION_DEFAULTS,
};

/** Atualização parcial — mesmos dados de pista do exemplo completo do aeródromo. */
export const TECHNICAL_VISIT_UPDATE_EXAMPLE = {
  visitorName: 'João Silva',
  city: TECHNICAL_VISIT_EXAMPLE_CITY,
  ...RUNWAY_SNAPSHOT,
  hasFence: false,
  fenceObservation: 'Trecho sul com brecha',
};

/** Resposta típica (`TechnicalVisitResponseDTO`). */
export const TECHNICAL_VISIT_RESPONSE_EXAMPLE = {
  id: TECHNICAL_VISIT_EXAMPLE_VISIT_ID,
  aerodromeId: TECHNICAL_VISIT_EXAMPLE_AERODROME_ID,
  uf: TECHNICAL_VISIT_EXAMPLE_UF,
  icao: TECHNICAL_VISIT_EXAMPLE_ICAO,
  aerodromeName: TECHNICAL_VISIT_EXAMPLE_AERODROME_NAME,
  visitorName: 'João Silva',
  city: TECHNICAL_VISIT_EXAMPLE_CITY,
  ...RUNWAY_SNAPSHOT,
  modifierUsers: [TECHNICAL_VISIT_EXAMPLE_ACTOR_ID],
  modifiers: [
    {
      name: 'Admin Aerobi',
      email: 'admin@aerobi.com.br',
      date: VISIT_AT,
      userId: TECHNICAL_VISIT_EXAMPLE_ACTOR_ID,
    },
  ],
  gatesPadlocksObservation: null,
  hasGatesPadlocks: true,
  fenceObservation: null,
  hasFence: true,
  standardPlateObservation: null,
  hasStandardPlate: true,
  qualityObservation: null,
  qualityOthersObservation: null,
  hasQualityHoles: false,
  hasQualityAsphalt: false,
  hasQualityOthers: false,
  horizontalSignageObservation: null,
  hasHorizontalSignage: true,
  unobstructedHeadboardsObservation: null,
  hasUnobstructedHeadboards: true,
  trackRangeObservation: null,
  hasTrackRange: true,
  pavementRegularity: true,
  trashDebrisObservation: null,
  hasTrashDebris: false,
  delimitedPerimeterObservation: null,
  hasDelimitedPerimeter: true,
  hasInvasion: false,
  extraObservation: null,
  visitAt: VISIT_AT,
  visitBy: TECHNICAL_VISIT_EXAMPLE_ACTOR_ID,
  createdAt: VISIT_AT,
  createdBy: TECHNICAL_VISIT_EXAMPLE_ACTOR_ID,
  updatedAt: VISIT_AT,
  updatedBy: TECHNICAL_VISIT_EXAMPLE_ACTOR_ID,
  deletedAt: null,
  deletedBy: null,
};

export const TECHNICAL_VISITS_PAGINATED_EXAMPLE = {
  data: [TECHNICAL_VISIT_RESPONSE_EXAMPLE],
  meta: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

export const TECHNICAL_VISIT_IMAGE_RESPONSE_EXAMPLE = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  technicalVisitId: TECHNICAL_VISIT_EXAMPLE_VISIT_ID,
  section: 'fence',
  imageUrl: 'https://minio.example/aerobi-dev/presigned',
  originalFilename: 'cerca-aeroporto-congonhas.jpg',
  mimeType: 'image/jpeg',
  sizeBytes: 245_760,
  uploadedBy: TECHNICAL_VISIT_EXAMPLE_ACTOR_ID,
  createdAt: VISIT_AT,
  updatedAt: VISIT_AT,
};
