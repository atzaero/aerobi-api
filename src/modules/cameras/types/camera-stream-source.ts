/**
 * Projeção mínima de uma câmera necessária para o **proxy HLS público**
 * (`camera-streams`, #473): só os campos que o proxy usa para montar a URL do
 * mediamtx e a listagem pública. Deliberadamente **não** carrega auditoria
 * (`createdBy`/`updatedBy`/…) nem timestamps — é o contrato de leitura entre o
 * módulo `cameras` (dono dos metadados) e o `camera-streams` (consumidor).
 *
 * `mediamtxNode`/`mediamtxPath` são topologia interna da tailnet e **nunca**
 * chegam à resposta pública (o mapper do `camera-streams` os descarta); ficam
 * aqui porque o proxy precisa deles para o passthrough.
 */
export interface CameraStreamSource {
  id: string;
  icao: string;
  name: string;
  mediamtxNode: string;
  mediamtxPath: string;
  enabled: boolean;
}
