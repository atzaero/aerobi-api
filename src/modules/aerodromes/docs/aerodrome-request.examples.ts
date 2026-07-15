/**
 * Exemplos de payload **válidos** para create/update de aeródromo, usados nos
 * seletores de exemplo do Swagger (`@ApiBody({ examples })`). Todos passam nas
 * validações dos DTOs (ICAO 4/uppercase, DMS, dígitos, E.164, pista condicional)
 * — o dev copia o exemplo e a requisição funciona.
 */

const GROUP_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

/** Criação com todos os campos (obrigatórios + opcionais) preenchidos. */
export const AERODROME_EXAMPLE_FULL = {
  groupId: GROUP_ID,
  icao: 'SBSP',
  name: 'Aeroporto de Congonhas',
  ciad: 'SP0001',
  municipality: 'São Paulo',
  emergencyPhone: '+5541999724341',
  latitude: '03°27\'18.50"S',
  longitude: '041°36\'16.91"W',
  altitude: '260',
  operation: 'VFR',
  weatherStationCode: '9133',
  construction: false,
  designation: '02/20',
  length: '1200',
  width: '20',
  resistance: '5700Kg/1.25MPa',
  surface: 'Asfalto',
  isOpen: true,
  weatherStationDisplay: false,
  lit: true,
  fueling: false,
  observation: 'Atenção à linha elétrica na aproximação 20',
};

/**
 * Mínimo operacional: só os obrigatórios. Como `construction` não é `true`, a
 * pista (`designation`/`length`/`width`/`resistance`/`surface`) é exigida.
 */
export const AERODROME_EXAMPLE_MIN_OPERATIONAL = {
  groupId: GROUP_ID,
  icao: 'SBSP',
  name: 'Aeroporto de Congonhas',
  latitude: '03°27\'18.50"S',
  longitude: '041°36\'16.91"W',
  altitude: '260',
  designation: '02/20',
  length: '1200',
  width: '20',
  resistance: '5700Kg/1.25MPa',
  surface: 'Asfalto',
};

/**
 * Mínimo em construção: `construction: true` dispensa os campos de pista, então
 * é o payload mais enxuto possível.
 */
export const AERODROME_EXAMPLE_MIN_CONSTRUCTION = {
  groupId: GROUP_ID,
  icao: 'SBSP',
  name: 'Aeroporto de Congonhas',
  latitude: '03°27\'18.50"S',
  longitude: '041°36\'16.91"W',
  altitude: '260',
  construction: true,
};

/** Edição completa (full edit): todos os campos + `isView` (publicação). */
export const AERODROME_UPDATE_EXAMPLE_FULL = {
  ...AERODROME_EXAMPLE_FULL,
  isView: true,
};

/** Edição mínima operacional: os obrigatórios + pista + `isView`. */
export const AERODROME_UPDATE_EXAMPLE_MIN_OPERATIONAL = {
  ...AERODROME_EXAMPLE_MIN_OPERATIONAL,
  isView: false,
};
