/**
 * Configuração de uma câmera resolvida a partir do Firestore (collection
 * `cameras`, gerida pelo frontend — atzaero/aerobi#1008).
 *
 * É um **ponteiro** para o stream HLS já servido pelo mediamtx no Raspi: não
 * guarda credencial RTSP (a senha da câmera nunca sai do Raspi). O backend usa
 * `mediamtxNode` + `mediamtxPath` apenas para montar a URL de proxy via tailnet.
 *
 * Campos: `id` (doc Firestore `cameras/{id}`); `icao` (ICAO do aeródromo, em
 * uppercase, igual a `Movement.aerodrome`); `name` (nome amigável exibido na
 * página pública); `mediamtxNode` (host/hostname tailnet do mediamtx, ex.
 * `aerobi-edge-mvp`); `mediamtxPath` (path do stream no mediamtx, ex.
 * `aero-mvp-cam-1`, sem barras nas pontas); `enabled` (`false` oculta da
 * listagem e bloqueia o proxy com 404).
 */
export interface Camera {
  id: string;
  icao: string;
  name: string;
  mediamtxNode: string;
  mediamtxPath: string;
  enabled: boolean;
}
