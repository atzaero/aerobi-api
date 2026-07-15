# utils

Funções puras e helpers reutilizáveis **dentro deste módulo**.

Exemplos típicos:
- construtores de `where` a partir da query (ex.: `build-geojson-where.util.ts`);
- normalizadores de strings, datas, enums;
- constantes do domínio.

## Regras

- Sem dependências Nest (`@Injectable`, `@Inject`). Se precisar, suba para `services/`.
- Pura quando possível. Testes `*.spec.ts` ao lado.
- Se a utilidade for útil a outros módulos, mova para `src/common/utils/`.
