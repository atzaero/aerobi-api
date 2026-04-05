/**
 * Tipos partilhados do proxy Plugfield.
 * Referência UI: https://wdg.plugfield.com.br/doc-api/index.html
 */

export type PlugfieldDeviceListQuery = {
  readonly deviceId?: string;
  readonly code?: string;
};

export type PlugfieldDeviceAssociateInput = {
  readonly deviceId?: string;
  readonly code?: string;
};

export type PlugfieldDataQuery = {
  readonly sensorId?: string;
  readonly deviceId?: string;
  readonly startTime?: number;
  readonly endTime?: number;
};

export type PlugfieldDataResult = Record<string, unknown> | unknown[];
