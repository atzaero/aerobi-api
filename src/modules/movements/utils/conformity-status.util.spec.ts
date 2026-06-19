import { ConformityStatus, MovementType } from '@/generated/prisma/enums';

import {
  isConformityApplicable,
  resolveInitialConformityStatus,
} from './conformity-status.util';

describe('conformity-status.util', () => {
  describe('isConformityApplicable', () => {
    it('aplica-se a pouso com aeródromo', () => {
      expect(
        isConformityApplicable({
          operationType: MovementType.LANDING,
          aerodrome: 'SSCF',
        }),
      ).toBe(true);
    });

    it('não se aplica a decolagem', () => {
      expect(
        isConformityApplicable({
          operationType: MovementType.TAKEOFF,
          aerodrome: 'SSCF',
        }),
      ).toBe(false);
    });

    it('não se aplica a pouso sem aeródromo', () => {
      expect(
        isConformityApplicable({
          operationType: MovementType.LANDING,
          aerodrome: null,
        }),
      ).toBe(false);
    });
  });

  describe('resolveInitialConformityStatus', () => {
    it('PENDING quando a regra se aplica', () => {
      expect(
        resolveInitialConformityStatus({
          operationType: MovementType.LANDING,
          aerodrome: 'SSCF',
        }),
      ).toBe(ConformityStatus.PENDING);
    });

    it('NOT_APPLICABLE para decolagem', () => {
      expect(
        resolveInitialConformityStatus({
          operationType: MovementType.TAKEOFF,
          aerodrome: 'SSCF',
        }),
      ).toBe(ConformityStatus.NOT_APPLICABLE);
    });

    it('NOT_APPLICABLE para pouso sem aeródromo', () => {
      expect(
        resolveInitialConformityStatus({
          operationType: MovementType.LANDING,
          aerodrome: null,
        }),
      ).toBe(ConformityStatus.NOT_APPLICABLE);
    });
  });
});
