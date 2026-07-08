import { UserRole } from '@/generated/prisma/client';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { ErrorMessageService } from '@/common/error-messages/error-message.service';
import type { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import { buildAuthenticatedUserFixture } from '@/modules/auth/testing/authenticated-user.fixtures';
import type { UserRepository } from '@/modules/users/repositories/user.repository';
import type { PrismaService } from '@/prisma/prisma.service';

import type { CreateTechnicalVisitDTO } from '../dtos/create-technical-visit.dto';
import { buildTechnicalVisitCreateInput } from '../mappers/technical-visit.prisma.mapper';
import type { TechnicalVisitRepository } from '../repositories/technical-visit.repository';
import { buildTechnicalVisitWithAerodromeFixture } from '../testing/technical-visit.entity.fixture';

import { CreateTechnicalVisitService } from './create-technical-visit.service';

const actor = buildAuthenticatedUserFixture({
  id: '33333333-3333-4333-8333-333333333333',
  email: 'actor@test.com',
  role: UserRole.ADMIN,
});

const coordinatorNoGroup = buildAuthenticatedUserFixture({
  id: '44444444-4444-4444-8444-444444444444',
  email: 'coord@test.com',
  role: UserRole.COORDINATOR,
});

describe('CreateTechnicalVisitService', () => {
  let service: CreateTechnicalVisitService;
  let create: jest.Mock;
  let findActiveById: jest.Mock;
  let aerodromeFindFirst: jest.Mock;

  beforeEach(() => {
    create = jest.fn();
    findActiveById = jest.fn().mockResolvedValue({ groupId: 'g1' });
    aerodromeFindFirst = jest.fn().mockResolvedValue({
      id: 'a1',
      groupId: 'g1',
      group: { uf: 'GO' },
    });
    const repo = {
      create,
    } as unknown as TechnicalVisitRepository;
    service = new CreateTechnicalVisitService(
      repo,
      {
        findActiveById,
        findManyByIds: jest.fn().mockResolvedValue([]),
      } as unknown as UserRepository,
      {
        aerodrome: { findFirst: aerodromeFindFirst },
      } as unknown as PrismaService,
      { getMessage: jest.fn() } as unknown as ErrorMessageService,
      { record: jest.fn() } as unknown as AuditRecorderService,
    );
  });

  it('create com campos do form', async () => {
    const dto: CreateTechnicalVisitDTO = {
      aerodromeId: '22222222-2222-4222-8222-222222222222',
      visitorName: 'Vistoriador',
      city: 'Goiânia',
      visitAt: new Date('2024-03-01T08:00:00.000Z'),
      extraObservation: 'note',
    };
    const row = buildTechnicalVisitWithAerodromeFixture({
      extraObservation: 'note',
      visitAt: dto.visitAt,
    });
    create.mockResolvedValue(row);

    await service.execute(dto, actor);

    expect(create).toHaveBeenCalledTimes(1);
    const [input] = create.mock.calls[0] as [
      ReturnType<typeof buildTechnicalVisitCreateInput>,
    ];
    expect(input.modifierUsers).toEqual([actor.id]);
    expect(input.modifierAtTimes).toHaveLength(1);
    expect(input.aerodrome).toEqual({ connect: { id: dto.aerodromeId } });
    expect(input.visitorName).toBe(dto.visitorName);
  });

  it('404 quando coordinator sem grupo tenta criar', async () => {
    findActiveById.mockResolvedValue({ groupId: null });
    aerodromeFindFirst.mockResolvedValue({
      id: '22222222-2222-4222-8222-222222222222',
      groupId: 'g1',
      group: { uf: 'GO' },
    });
    const dto: CreateTechnicalVisitDTO = {
      aerodromeId: '22222222-2222-4222-8222-222222222222',
      visitorName: 'Vistoriador',
      city: 'Goiânia',
      visitAt: new Date('2024-03-01T08:00:00.000Z'),
    };
    await expect(
      service.execute(dto, coordinatorNoGroup),
    ).rejects.toBeInstanceOf(CustomHttpException);
    expect(create).not.toHaveBeenCalled();
  });

  it('404 quando aeródromo está fora do grupo do ator', async () => {
    findActiveById.mockResolvedValue({ groupId: 'g1' });
    aerodromeFindFirst.mockResolvedValue({
      id: '22222222-2222-4222-8222-222222222222',
      groupId: 'g-other',
      group: { uf: 'GO' },
    });
    const dto: CreateTechnicalVisitDTO = {
      aerodromeId: '22222222-2222-4222-8222-222222222222',
      visitorName: 'Vistoriador',
      city: 'Goiânia',
      visitAt: new Date('2024-03-01T08:00:00.000Z'),
    };
    await expect(
      service.execute(
        dto,
        buildAuthenticatedUserFixture({ role: UserRole.OPERATOR }),
      ),
    ).rejects.toBeInstanceOf(CustomHttpException);
    expect(create).not.toHaveBeenCalled();
  });
});
