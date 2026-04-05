/**
 * Exemplos ilustrativos para Swagger (formato real pode variar; ver documentação Plugfield).
 */

export const plugfieldLoginResponseExample: Record<string, unknown> = {
  access_token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.example',
};

export const plugfieldDeviceListResponseExample: unknown[] = [
  {
    deviceId: 'device-uuid-001',
    code: 'EST-001',
    name: 'Estação exemplo',
    active: true,
  },
];

export const plugfieldDeviceAssociateResponseExample: Record<string, unknown> =
  {
    success: true,
    deviceId: 'device-uuid-001',
  };

export const plugfieldDeviceByIdResponseExample: Record<string, unknown> = {
  deviceId: 'device-uuid-001',
  code: 'EST-001',
  name: 'Estação exemplo',
  sensors: [{ sensorId: 'sensor-1', type: 'TEMPERATURE' }],
};

/** Agrupamento por timestamp (ms) — típico de séries diárias/horárias. */
export const plugfieldDataGroupedResponseExample: Record<string, unknown> = {
  '1704067200000': { avg: 22.5, min: 19.1, max: 26.3, samples: 48 },
  '1704153600000': { avg: 21.8, min: 18.4, max: 25.9, samples: 48 },
};

/** Lista de leituras — comum em `/data/sensor`. */
export const plugfieldDataSeriesResponseExample: unknown[] = [
  { timestamp: 1704067200000, value: 21.2, unit: 'C' },
  { timestamp: 1704070800000, value: 20.8, unit: 'C' },
];
