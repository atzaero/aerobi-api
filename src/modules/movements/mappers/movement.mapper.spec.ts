import type {
  Movement,
  MovementAircraftSnapshot,
} from '@/generated/prisma/client';

import { MovementMapper } from './movement.mapper';

/**
 * Cobre a normalização do detalhe `GET /movements/:id`: `operadores` e
 * `proprietarios` saem do snapshot como JSON-como-texto e devem chegar à API
 * como arrays tipados. Os demais campos seguem o passthrough já existente.
 */
describe('MovementMapper.toApiRow — normalização do snapshot', () => {
  const baseMovement = (
    aircraftSnapshot: MovementAircraftSnapshot | null,
  ): Movement & { aircraftSnapshot: MovementAircraftSnapshot | null } =>
    ({
      id: 'mov-1',
      registration: 'PR-ZTT',
      operationType: 'LANDING',
      source: 'AUTOMATIC',
      readingDatetime: new Date('2026-06-08T16:52:39.000Z'),
      readingStatus: 'CONFIRMED',
      revisorId: null,
      imageKey: null,
      comments: null,
      aerodrome: 'SSCF',
      conformityStatus: 'CONFORMANT',
      createdAt: new Date('2026-06-08T16:52:39.000Z'),
      updatedAt: new Date('2026-06-08T16:52:39.000Z'),
      aircraftSnapshot,
    }) as unknown as Movement & {
      aircraftSnapshot: MovementAircraftSnapshot | null;
    };

  const snapshot = (
    overrides: Partial<MovementAircraftSnapshot>,
  ): MovementAircraftSnapshot => ({
    id: 'snap-1',
    movementId: 'mov-1',
    rabRowId: 'rab-1',
    rabPeriod: '2026-06',
    marcas: 'PR-ZTT',
    proprietarios: null,
    operadores: null,
    nrSerie: null,
    dsModelo: null,
    nmFabricante: null,
    cdTipoIcao: null,
    nrPmd: null,
    nrAssentos: null,
    nrAnoFabricacao: null,
    tpMotor: null,
    qtMotor: null,
    cfOperacional: null,
    tpOperacao: null,
    createdAt: new Date('2026-06-08T16:52:39.000Z'),
    ...overrides,
  });

  it('parses operadores/proprietarios JSON-como-texto em arrays tipados', () => {
    const entity = baseMovement(
      snapshot({
        proprietarios: JSON.stringify([
          {
            NOME: 'FULANO',
            DOCUMENTO: '231XXXXXX68',
            PERCENTUAL: '100.00',
            UF: 'PR',
          },
        ]),
        operadores: JSON.stringify([
          { NOME: 'EMPRESA', OPERACAO135: 'S', UF: 'PR' },
        ]),
      }),
    );

    const row = MovementMapper.toApiRow(entity, null);

    expect(row.aircraftSnapshot?.proprietarios).toEqual([
      {
        NOME: 'FULANO',
        DOCUMENTO: '231XXXXXX68',
        PERCENTUAL: '100.00',
        UF: 'PR',
      },
    ]);
    expect(row.aircraftSnapshot?.operadores).toEqual([
      {
        NOME: 'EMPRESA',
        DOCUMENTO: null,
        OPERACAO135: 'S',
        TRANSPREGULAR135: null,
        AUTORIZACAOPMAC135: null,
        OPERACAO121: null,
        TRANSPREGULAR121: null,
        AUTORIZACAOPMAC121: null,
        SAE: null,
        AUTHISTRUT: null,
        UF: 'PR',
      },
    ]);
  });

  it('devolve [] quando operadores/proprietarios são null ou ilegíveis', () => {
    const entity = baseMovement(
      snapshot({ proprietarios: null, operadores: 'lixo' }),
    );

    const row = MovementMapper.toApiRow(entity, null);

    expect(row.aircraftSnapshot?.proprietarios).toEqual([]);
    expect(row.aircraftSnapshot?.operadores).toEqual([]);
  });

  it('mantém aircraftSnapshot null quando ausente', () => {
    const row = MovementMapper.toApiRow(baseMovement(null), null);
    expect(row.aircraftSnapshot).toBeNull();
  });

  it('propaga o conformityStatus do movimento', () => {
    const row = MovementMapper.toApiRow(baseMovement(null), null);
    expect(row.conformityStatus).toBe('CONFORMANT');
  });
});
