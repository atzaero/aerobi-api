/**
 * Port (interface) do diretório de leitura do Firestore para o fluxo de
 * conformidade (#248).
 *
 * Os consumidores dependem **apenas** deste contrato e do token de injeção
 * {@link FIRESTORE_DIRECTORY_PORT}; nenhum detalhe do Firestore (nomes de
 * coleções, campos snake_case, `Timestamp`) vaza para fora do adapter. Isto
 * permite que a futura migração Firestore → Postgres troque só o adapter.
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

export interface FirestoreDirectoryPort {
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
export const FIRESTORE_DIRECTORY_PORT = Symbol('FirestoreDirectoryPort');
