import { Request } from 'express';

/**
 * Reads `Authorization` from the incoming HTTP request (client → aerobi-api).
 */
export function readIncomingAuthorization(req: Request): string | undefined {
  const raw = req.headers['authorization'];
  if (typeof raw !== 'string') {
    return undefined;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
