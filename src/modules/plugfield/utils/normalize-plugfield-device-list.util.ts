/**
 * Normaliza respostas variadas da Plugfield GET /device para um array de itens.
 */
export function normalizePlugfieldDeviceList(json: unknown): unknown[] {
  if (Array.isArray(json)) {
    return json;
  }
  if (
    json &&
    typeof json === 'object' &&
    'data' in json &&
    Array.isArray((json as { data?: unknown[] }).data)
  ) {
    return (json as { data: unknown[] }).data;
  }
  if (
    json &&
    typeof json === 'object' &&
    'devices' in json &&
    Array.isArray((json as { devices?: unknown[] }).devices)
  ) {
    return (json as { devices: unknown[] }).devices;
  }
  if (
    json &&
    typeof json === 'object' &&
    'deviceList' in json &&
    Array.isArray((json as { deviceList?: unknown[] }).deviceList)
  ) {
    return (json as { deviceList: unknown[] }).deviceList;
  }
  return [];
}
