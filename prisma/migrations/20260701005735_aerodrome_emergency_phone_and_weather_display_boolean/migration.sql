-- Adiciona telefone de emergência (E.164) ao aeródromo — paridade com aerobi-web; absorve #269.
ALTER TABLE "aerodromes" ADD COLUMN "emergency_phone" TEXT;

-- Converte weather_station_display de texto legado para boolean (toggle de status na paridade web).
-- Backfill: 'true'/'t'/'1' -> true; 'false'/'f'/'0' -> false; demais valores/NULL -> NULL.
ALTER TABLE "aerodromes"
  ALTER COLUMN "weather_station_display" TYPE BOOLEAN
  USING (
    CASE
      WHEN lower("weather_station_display") IN ('true', 't', '1') THEN true
      WHEN lower("weather_station_display") IN ('false', 'f', '0') THEN false
      ELSE NULL
    END
  );
