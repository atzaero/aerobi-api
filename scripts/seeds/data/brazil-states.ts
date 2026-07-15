/**
 * Dados estáveis das 27 unidades federativas do Brasil usados pelo seed
 * `states`: nome por extenso de cada UF (compõe nome de grupo e de usuário) e a
 * especificação das funções geradas por estado (rótulo no email em inglês,
 * rótulo de exibição em português e a env que controla a contagem).
 */
import { Uf, UserRole } from '@/generated/prisma/enums';

/**
 * Nome por extenso de cada UF (com acentuação). Usado para `"Grupo <Estado>"` e
 * `"<Função> - <Estado>"`.
 */
export const UF_TO_NAME: Readonly<Record<Uf, string>> = {
  [Uf.AC]: 'Acre',
  [Uf.AL]: 'Alagoas',
  [Uf.AM]: 'Amazonas',
  [Uf.AP]: 'Amapá',
  [Uf.BA]: 'Bahia',
  [Uf.CE]: 'Ceará',
  [Uf.DF]: 'Distrito Federal',
  [Uf.ES]: 'Espírito Santo',
  [Uf.GO]: 'Goiás',
  [Uf.MA]: 'Maranhão',
  [Uf.MG]: 'Minas Gerais',
  [Uf.MS]: 'Mato Grosso do Sul',
  [Uf.MT]: 'Mato Grosso',
  [Uf.PA]: 'Pará',
  [Uf.PB]: 'Paraíba',
  [Uf.PE]: 'Pernambuco',
  [Uf.PI]: 'Piauí',
  [Uf.PR]: 'Paraná',
  [Uf.RJ]: 'Rio de Janeiro',
  [Uf.RN]: 'Rio Grande do Norte',
  [Uf.RO]: 'Rondônia',
  [Uf.RR]: 'Roraima',
  [Uf.RS]: 'Rio Grande do Sul',
  [Uf.SC]: 'Santa Catarina',
  [Uf.SE]: 'Sergipe',
  [Uf.SP]: 'São Paulo',
  [Uf.TO]: 'Tocantins',
};

/** Todas as UFs, em ordem estável de execução do seed. */
export const ALL_UFS: ReadonlyArray<Uf> = Object.keys(UF_TO_NAME) as Uf[];

/**
 * Especificação de uma função gerada por estado: a role do enum, o rótulo em
 * inglês usado no local-part do email (`coordinator_pi@...`), o rótulo em
 * português para o nome de exibição (`Coordenador - Piauí`) e a env que define
 * quantos usuários dessa função criar por estado.
 */
export type StateRoleSpec = {
  role: UserRole;
  emailLabel: string;
  displayLabel: string;
  countEnv: string;
};

/** Funções criadas para cada estado (não inclui ADMIN, que é global e único). */
export const STATE_ROLE_SPECS: ReadonlyArray<StateRoleSpec> = [
  {
    role: UserRole.COORDINATOR,
    emailLabel: 'coordinator',
    displayLabel: 'Coordenador',
    countEnv: 'SEED_COORDINATORS_PER_STATE',
  },
  {
    role: UserRole.OPERATOR,
    emailLabel: 'operator',
    displayLabel: 'Operador',
    countEnv: 'SEED_OPERATORS_PER_STATE',
  },
  {
    role: UserRole.TECHNICAL,
    emailLabel: 'technical',
    displayLabel: 'Técnico',
    countEnv: 'SEED_TECHNICALS_PER_STATE',
  },
];
