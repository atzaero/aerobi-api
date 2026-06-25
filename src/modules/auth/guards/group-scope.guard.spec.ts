import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import { GroupScopeGuard } from './group-scope.guard';
import { GroupScopeSubject } from './group-scope.subject';

const RESOURCE_ID = '11111111-1111-4111-8111-111111111111';
const GROUP_A = '22222222-2222-4222-8222-222222222222';
const GROUP_B = '33333333-3333-4333-8333-333333333333';

type GuardUser = { id: string; email: string; role: UserRole };

function buildContext(
  user: GuardUser | undefined,
  params: Record<string, string | undefined> = { id: RESOURCE_ID },
): ExecutionContext {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ user, params }) }),
  } as unknown as ExecutionContext;
}

function buildPrisma(): {
  prisma: PrismaService;
  aerodromeGroup: { findFirst: jest.Mock };
  operationalAerodrome: { findFirst: jest.Mock };
  landingRequest: { findFirst: jest.Mock };
  user: { findFirst: jest.Mock };
} {
  const aerodromeGroup = { findFirst: jest.fn() };
  const operationalAerodrome = { findFirst: jest.fn() };
  const landingRequest = { findFirst: jest.fn() };
  const user = { findFirst: jest.fn() };

  return {
    prisma: {
      aerodromeGroup,
      operationalAerodrome,
      landingRequest,
      user,
    } as unknown as PrismaService,
    aerodromeGroup,
    operationalAerodrome,
    landingRequest,
    user,
  };
}

describe('GroupScopeGuard', () => {
  let guard: GroupScopeGuard;
  let reflector: Reflector;
  let deps: ReturnType<typeof buildPrisma>;

  const operator: GuardUser = {
    id: 'user-1',
    email: 'op@e',
    role: UserRole.OPERATOR,
  };
  const admin: GuardUser = {
    id: 'admin-1',
    email: 'admin@e',
    role: UserRole.ADMIN,
  };

  beforeEach(() => {
    reflector = new Reflector();
    deps = buildPrisma();
    guard = new GroupScopeGuard(
      reflector,
      deps.prisma,
      new ErrorMessageService(),
    );
  });

  function mockSubject(subject: GroupScopeSubject | undefined): void {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(subject);
  }

  async function expectErrorCode(
    promise: Promise<unknown>,
    code: ErrorCode,
  ): Promise<void> {
    await expect(promise).rejects.toBeInstanceOf(CustomHttpException);
    await promise.catch((e) => {
      expect((e as CustomHttpException).getErrorCode()).toBe(code);
    });
  }

  it('passa quando o handler não tem @RequiresGroupScope', async () => {
    mockSubject(undefined);

    await expect(guard.canActivate(buildContext(operator))).resolves.toBe(true);
    expect(deps.operationalAerodrome.findFirst).not.toHaveBeenCalled();
  });

  it('passa (bypass) quando o usuário é ADMIN, sem tocar no DB', async () => {
    mockSubject(GroupScopeSubject.OPERATIONAL_AERODROME);

    await expect(guard.canActivate(buildContext(admin))).resolves.toBe(true);
    expect(deps.operationalAerodrome.findFirst).not.toHaveBeenCalled();
    expect(deps.user.findFirst).not.toHaveBeenCalled();
  });

  it('passa quando o recurso pertence ao mesmo grupo do usuário', async () => {
    mockSubject(GroupScopeSubject.OPERATIONAL_AERODROME);
    deps.operationalAerodrome.findFirst.mockResolvedValue({
      groupId: GROUP_A,
    });
    deps.user.findFirst.mockResolvedValue({ aerodromeGroupId: GROUP_A });

    await expect(guard.canActivate(buildContext(operator))).resolves.toBe(true);
    expect(deps.user.findFirst).toHaveBeenCalledWith({
      where: { id: operator.id, deletedAt: null },
      select: { aerodromeGroupId: true },
    });
    expect(deps.operationalAerodrome.findFirst).toHaveBeenCalledWith({
      where: { id: RESOURCE_ID, deletedAt: null },
      select: { groupId: true },
    });
  });

  it('resolve o próprio grupo quando o recurso É o grupo (AerodromeGroup)', async () => {
    mockSubject(GroupScopeSubject.AERODROME_GROUP);
    deps.aerodromeGroup.findFirst.mockResolvedValue({ id: RESOURCE_ID });
    // O grupo do recurso é o próprio id; o coordinator deve pertencer a ele.
    deps.user.findFirst.mockResolvedValue({ aerodromeGroupId: RESOURCE_ID });

    await expect(guard.canActivate(buildContext(operator))).resolves.toBe(true);
    expect(deps.aerodromeGroup.findFirst).toHaveBeenCalledWith({
      where: { id: RESOURCE_ID, deletedAt: null },
      select: { id: true },
    });
  });

  it('lança FORBIDDEN quando o grupo-alvo não é o do coordinator (AerodromeGroup)', async () => {
    mockSubject(GroupScopeSubject.AERODROME_GROUP);
    deps.aerodromeGroup.findFirst.mockResolvedValue({ id: RESOURCE_ID });
    deps.user.findFirst.mockResolvedValue({ aerodromeGroupId: GROUP_B });

    await expectErrorCode(
      guard.canActivate(buildContext(operator)),
      ErrorCode.FORBIDDEN,
    );
  });

  it('resolve o grupo de um recurso filho via FK (LandingRequest)', async () => {
    mockSubject(GroupScopeSubject.LANDING_REQUEST);
    deps.landingRequest.findFirst.mockResolvedValue({
      operationalAerodrome: { groupId: GROUP_A },
    });
    deps.user.findFirst.mockResolvedValue({ aerodromeGroupId: GROUP_A });

    await expect(guard.canActivate(buildContext(operator))).resolves.toBe(true);
    expect(deps.landingRequest.findFirst).toHaveBeenCalled();
  });

  it('lança FORBIDDEN quando o recurso é de outro grupo', async () => {
    mockSubject(GroupScopeSubject.OPERATIONAL_AERODROME);
    deps.operationalAerodrome.findFirst.mockResolvedValue({
      groupId: GROUP_A,
    });
    deps.user.findFirst.mockResolvedValue({ aerodromeGroupId: GROUP_B });

    await expectErrorCode(
      guard.canActivate(buildContext(operator)),
      ErrorCode.FORBIDDEN,
    );
  });

  it('lança FORBIDDEN quando o usuário não tem grupo (groupId null)', async () => {
    mockSubject(GroupScopeSubject.OPERATIONAL_AERODROME);
    deps.operationalAerodrome.findFirst.mockResolvedValue({
      groupId: GROUP_A,
    });
    deps.user.findFirst.mockResolvedValue({ aerodromeGroupId: null });

    await expectErrorCode(
      guard.canActivate(buildContext(operator)),
      ErrorCode.FORBIDDEN,
    );
  });

  it('lança FORBIDDEN quando o usuário foi soft-deletado (lookup retorna null)', async () => {
    mockSubject(GroupScopeSubject.OPERATIONAL_AERODROME);
    deps.operationalAerodrome.findFirst.mockResolvedValue({
      groupId: GROUP_A,
    });
    // JwtStrategy confia no token; o lookup ativo (deletedAt: null) devolve null.
    deps.user.findFirst.mockResolvedValue(null);

    await expectErrorCode(
      guard.canActivate(buildContext(operator)),
      ErrorCode.FORBIDDEN,
    );
  });

  it('lança RESOURCE_NOT_FOUND quando o recurso não existe', async () => {
    mockSubject(GroupScopeSubject.OPERATIONAL_AERODROME);
    deps.operationalAerodrome.findFirst.mockResolvedValue(null);

    await expectErrorCode(
      guard.canActivate(buildContext(operator)),
      ErrorCode.RESOURCE_NOT_FOUND,
    );
    expect(deps.user.findFirst).not.toHaveBeenCalled();
  });

  it('lança UNAUTHORIZED quando request.user está ausente', async () => {
    mockSubject(GroupScopeSubject.OPERATIONAL_AERODROME);

    await expectErrorCode(
      guard.canActivate(buildContext(undefined)),
      ErrorCode.UNAUTHORIZED,
    );
  });

  it('lança VALIDATION_FAILED quando params.id não é UUID', async () => {
    mockSubject(GroupScopeSubject.OPERATIONAL_AERODROME);

    await expectErrorCode(
      guard.canActivate(buildContext(operator, { id: 'not-a-uuid' })),
      ErrorCode.VALIDATION_FAILED,
    );
    expect(deps.operationalAerodrome.findFirst).not.toHaveBeenCalled();
  });

  it('lança VALIDATION_FAILED quando params.id está ausente', async () => {
    mockSubject(GroupScopeSubject.OPERATIONAL_AERODROME);

    await expectErrorCode(
      guard.canActivate(buildContext(operator, {})),
      ErrorCode.VALIDATION_FAILED,
    );
  });
});
