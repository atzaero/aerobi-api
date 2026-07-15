import type { Prisma } from '@/generated/prisma/client';

export const technicalVisitWithAerodromeInclude = {
  aerodrome: {
    select: {
      icao: true,
      name: true,
      group: { select: { uf: true } },
    },
  },
} as const satisfies Prisma.TechnicalVisitInclude;

export type TechnicalVisitWithAerodrome = Prisma.TechnicalVisitGetPayload<{
  include: typeof technicalVisitWithAerodromeInclude;
}>;
