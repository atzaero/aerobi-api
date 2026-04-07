#!/usr/bin/env bash
#
# Chamadas de fumaça às rotas AISWEB da Aerobi API (SOL, ROTAER, INFOTEMP, NOTAM).
#
# Uso:
#   export AEROBI_API_KEY='…'   # ou: set -a && source .env && set +a
#   ./scripts/aisweb-api-smoke.sh
#
# Variáveis opcionais:
#   AISWEB_BASE_URL   — default https://api.aerobi.com.br
#   AISWEB_SMOKE_OUT  — pasta de saída JSON (default: ${TMPDIR:-/tmp}/aisweb-smoke)
#
set -u

if [[ -z "${AEROBI_API_KEY:-}" ]]; then
  printf 'Erro: defina AEROBI_API_KEY no ambiente (ex.: export a partir de .env).\n' >&2
  exit 1
fi

BASE_URL="${AISWEB_BASE_URL:-https://api.aerobi.com.br}"
OUT_DIR="${AISWEB_SMOKE_OUT:-${TMPDIR:-/tmp}/aisweb-smoke}"
mkdir -p "$OUT_DIR"

# Aeródromos com tráfego relevante no Brasil (amostra para respostas diversas)
ICAO_CODES=(SBGR SBSP SBGL SBRJ SBCF SBPA SBFL SBBR SBCT)

CURL=(curl -sS --connect-timeout 15 --max-time 120 -H "X-API-Key: ${AEROBI_API_KEY}")

failures=0

# $1 rótulo, $2 arquivo, $3 URL completa
smoke_request() {
  local label=$1
  local outfile=$2
  local url=$3
  local code bytes
  code="$("${CURL[@]}" -o "$outfile" -w '%{http_code}' "$url")" || code="000"
  bytes=$(wc -c <"$outfile" | tr -d ' ')
  printf '%-55s HTTP %s  %8s B  %s\n' "$label" "$code" "$bytes" "$outfile"
  if [[ ! "$code" =~ ^2 ]]; then
    failures=$((failures + 1))
  fi
}

printf 'Base: %s\nSaída: %s\n\n' "$BASE_URL" "$OUT_DIR"

printf '--- SOL (nascer/pôr do sol, um dia por ICAO) ---\n'
for icao in "${ICAO_CODES[@]}"; do
  smoke_request "SOL ${icao}" \
    "${OUT_DIR}/sol_${icao}.json" \
    "${BASE_URL}/aisweb/sol?icaoCode=${icao}"
done

printf '\n--- SOL intervalo (SBSP, 7 dias) ---\n'
smoke_request 'SOL SBSP dt_i/dt_f' \
  "${OUT_DIR}/sol_SBSP_range.json" \
  "${BASE_URL}/aisweb/sol?icaoCode=SBSP&dt_i=2026-04-01&dt_f=2026-04-07"

printf '\n--- ROTAER (ficha do aeródromo; JSON grande) ---\n'
for icao in "${ICAO_CODES[@]}"; do
  smoke_request "ROTAER ${icao}" \
    "${OUT_DIR}/rotaer_${icao}.json" \
    "${BASE_URL}/aisweb/rotaer?icaoCode=${icao}"
done

printf '\n--- INFOTEMP (pode retornar total 0) ---\n'
for icao in "${ICAO_CODES[@]}"; do
  smoke_request "INFOTEMP ${icao} dist=N" \
    "${OUT_DIR}/infotemp_${icao}.json" \
    "${BASE_URL}/aisweb/infotemp?icaoCode=${icao}&dist=N"
done

printf '\n--- NOTAM por aeródromo (dist=N + icaocode) ---\n'
for icao in "${ICAO_CODES[@]}"; do
  smoke_request "NOTAM ${icao}" \
    "${OUT_DIR}/notam_${icao}.json" \
    "${BASE_URL}/aisweb/notam?dist=N&icaocode=${icao}"
done

printf '\n--- NOTAM lista nacional (resposta muito grande) ---\n'
smoke_request 'NOTAM dist=N (sem ICAO)' \
  "${OUT_DIR}/notam_distN_all.json" \
  "${BASE_URL}/aisweb/notam?dist=N"

printf '\n--- Resumo ---\n'
if [[ "$failures" -eq 0 ]]; then
  printf 'Todas as requisições retornaram HTTP 2xx.\n'
  exit 0
fi

printf '%s requisição(ões) com falha (HTTP não 2xx).\n' "$failures" >&2
exit 1
