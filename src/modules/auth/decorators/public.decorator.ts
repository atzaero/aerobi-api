import { SetMetadata } from '@nestjs/common';

import { IS_PUBLIC_KEY } from '../constants/auth.constants';

/**
 * Marca uma rota como pública — o `JwtAuthGuard` ignora a verificação
 * de JWT. Útil para endpoints como login, refresh e health.
 *
 * Atualmente o `JwtAuthGuard` é opt-in (aplicado por controller). Esta
 * marcação fica disponível para quando o guard for promovido a global.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
