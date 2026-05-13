import { SetMetadata } from '@nestjs/common';

import { UserRole } from '@/generated/prisma/client';

import { ROLES_KEY } from '../constants/auth.constants';

/**
 * Restringe uma rota às roles informadas. Avaliado pelo `RolesGuard`
 * após o `JwtAuthGuard`.
 *
 * @example
 * ```ts
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles(UserRole.ADMIN)
 * @Get('/admin/dashboard')
 * adminDashboard() { ... }
 * ```
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
