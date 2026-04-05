import { BadGatewayException, BadRequestException } from '@nestjs/common';

import type { PlugfieldHttpService } from '../services/plugfield-http.service';
import type {
  PlugfieldDataQuery,
  PlugfieldDataResult,
} from '../types/plugfield.types';

function isDataShape(value: unknown): value is PlugfieldDataResult {
  if (value === null || value === undefined) {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  return typeof value === 'object';
}

/**
 * Executa GET `/data/*` na Plugfield com validação de query e formato de resposta.
 */
export async function requestPlugfieldData(
  http: PlugfieldHttpService,
  path: '/data/daily' | '/data/hourly' | '/data/sensor',
  query: PlugfieldDataQuery,
  incomingAuthorization?: string,
): Promise<PlugfieldDataResult> {
  const s = query.sensorId?.trim() ?? '';
  const d = query.deviceId?.trim() ?? '';
  if (s.length === 0 && d.length === 0) {
    throw new BadRequestException('Informe sensorId ou deviceId');
  }

  const raw = await http.requestJson({
    method: 'GET',
    path,
    query: {
      sensorId: s.length > 0 ? s : undefined,
      deviceId: d.length > 0 ? d : undefined,
      startTime: query.startTime,
      endTime: query.endTime,
    },
    useVendorAuthorization: true,
    incomingAuthorization,
  });

  if (!isDataShape(raw)) {
    throw new BadGatewayException(
      'Plugfield data endpoint returned an unexpected response shape',
    );
  }

  return raw;
}
