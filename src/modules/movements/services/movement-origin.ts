import type { MovementSource, MovementType } from '@/generated/prisma/enums';

/**
 * Descritor da ORIGEM de um movimento, passado ao `CreateMovementService`
 * (a fonte única de criação). Define como o registro entrou no sistema e quem
 * o inseriu, além do `operationType` quando ele já é conhecido na origem.
 *
 * - `AUTOMATIC` (pipeline aviascan-cv, rotas `/readings`): `createdBy` é um
 *   identificador fixo ('aviascan') e `operationType` é omitido — fica como
 *   placeholder LANDING até a regra de 48h da #234.
 * - `MANUAL` (interface humana, rota `POST /movements`): `operationType` vem do
 *   formulário e `createdBy` é o identificador do usuário (do corpo, por ora).
 */
export interface MovementOrigin {
  source: MovementSource;
  createdBy: string | null;
  operationType?: MovementType;
}
