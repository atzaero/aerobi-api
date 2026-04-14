/**
 * Tipos partilhados do proxy Plugfield.
 * Referência: https://wdg.plugfield.com.br/doc-api/index.html
 */

export type PlugfieldDeviceListQuery = {
  readonly page?: number;
};

export type PlugfieldDeviceAssociateInput = {
  readonly deviceId?: string;
  readonly code?: string;
};

export type PlugfieldDataSensorQuery = {
  readonly device: number;
  readonly sensor: number;
  readonly time?: number;
  readonly timeMax?: number;
  readonly groupedBy?: string;
};

export type PlugfieldDataDailyQuery = {
  readonly device: number;
  readonly begin: string;
  readonly end: string;
};

export type PlugfieldDataHourlyQuery = {
  readonly device: number;
  readonly begin: string;
  readonly end: string;
};

export type PlugfieldDataResult = Record<string, unknown> | unknown[];
