import { ConfigService } from '@nestjs/config';

/** `true` quando `NODE_ENV === 'development'` (default explícito). */
export function isDevelopmentEnvironment(
  configService: ConfigService,
): boolean {
  return configService.get<string>('NODE_ENV', 'development') === 'development';
}
