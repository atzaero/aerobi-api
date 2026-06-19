import {
  ConformityStatus,
  MovementSource,
  MovementType,
} from '@/generated/prisma/enums';

import type { MovementOrigin } from '../services/movement-origin';

import {
  buildMovementCreateInput,
  type MovementCreateData,
} from './movement.prisma.mapper';

describe('buildMovementCreateInput — conformityStatus inicial', () => {
  const dto: MovementCreateData = {
    registration: 'PRZTT',
    reading_datetime: new Date('2026-06-08T16:52:39Z'),
    aerodrome: 'SSCF',
  };

  const snapshot = {} as never;

  const origin = (over: Partial<MovementOrigin> = {}): MovementOrigin => ({
    source: MovementSource.AUTOMATIC,
    createdBy: 'aviascan',
    operationType: MovementType.LANDING,
    ...over,
  });

  it('PENDING para pouso com aeródromo', () => {
    const input = buildMovementCreateInput(dto, null, origin(), snapshot);
    expect(input.conformityStatus).toBe(ConformityStatus.PENDING);
  });

  it('NOT_APPLICABLE para decolagem', () => {
    const input = buildMovementCreateInput(
      dto,
      null,
      origin({ operationType: MovementType.TAKEOFF }),
      snapshot,
    );
    expect(input.conformityStatus).toBe(ConformityStatus.NOT_APPLICABLE);
  });

  it('NOT_APPLICABLE para pouso sem aeródromo', () => {
    const input = buildMovementCreateInput(
      { ...dto, aerodrome: undefined },
      null,
      origin(),
      snapshot,
    );
    expect(input.conformityStatus).toBe(ConformityStatus.NOT_APPLICABLE);
  });
});
