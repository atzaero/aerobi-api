/**
 * Port (interface) do diretório de leitura para o fluxo de conformidade (#248).
 *
 * Os consumidores dependem **apenas** deste contrato e do token de injeção
 * {@link DIRECTORY_PORT}; nenhum detalhe da fonte de dados (nomes de tabelas/
 * coleções, campos snake_case, tipos de timestamp) vaza para fora do adapter.
 * Isto permitiu a migração Firestore → Postgres trocando **só o adapter**
 * (`PostgresDirectoryAdapter`), sem tocar no port nem nos listeners (#475).
 */

/** Resultado do match de um pedido de aterragem aprovado. */
export interface LandingRequestMatch {
  id: string;
  aircraftRegistration: string;
  icao: string;
  status: string;
  requestDate: Date;
}

/** Aeródromo + grupo resolvidos por ICAO. */
export interface AerodromeGroup {
  aerodromeId: string;
  groupId: string;
}

/** Contacto de um grupo (utilizador) para notificação. */
export interface GroupContact {
  email: string;
  role: string;
  displayName: string | null;
  /**
   * Telefone do contacto em formato cru (pode ser `null`). Usado pelo canal de
   * WhatsApp (#307); o fluxo de e-mail ignora este campo.
   */
  phone: string | null;
}

/** Entrada para procurar um pedido de aterragem aprovado correspondente. */
export interface FindApprovedLandingRequestMatchInput {
  registration: string;
  aerodromeIcao: string;
  reference: Date;
  windowHours: number;
}

export interface DirectoryPort {
  /**
   * Procura um pedido de aterragem **aprovado** que case com a matrícula e o
   * ICAO do aeródromo, com `request_date` dentro de ±`windowHours` em relação a
   * `reference`. Devolve o mais próximo de `reference` ou `null`.
   */
  findApprovedLandingRequestMatch(
    input: FindApprovedLandingRequestMatchInput,
  ): Promise<LandingRequestMatch | null>;

  /**
   * Resolve o aeródromo (não eliminado) por ICAO, devolvendo o seu id e
   * `group_id`, ou `null` se não existir.
   */
  findAerodromeGroupByIcao(icao: string): Promise<AerodromeGroup | null>;

  /**
   * Lista os contactos (utilizadores não eliminados, com email) de um grupo,
   * filtrando pelas `roles` indicadas.
   */
  findGroupContacts(groupId: string, roles: string[]): Promise<GroupContact[]>;
}

/** Token de injeção do port. */
export const DIRECTORY_PORT = Symbol('DirectoryPort');
