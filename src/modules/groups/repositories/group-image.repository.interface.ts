import type { Group } from '@/generated/prisma/client';

/** Dados de uma nova imagem de grupo (a key já foi enviada ao storage). */
export interface CreateGroupImageInput {
  groupId: string;
  imageKey: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  actorId: string;
}

export interface IGroupImageRepository {
  /**
   * Transação que mantém **1 imagem ativa por grupo**: cria a nova imagem,
   * soft-deleta as anteriores ativas e sincroniza `group.imageKey`. Retorna o
   * grupo já atualizado, evitando um re-fetch no service.
   */
  createActiveImage(input: CreateGroupImageInput): Promise<Group>;

  /**
   * Transação que remove a imagem ativa, recomputa a próxima ativa e
   * ressincroniza `group.imageKey`. Retorna o grupo atualizado, ou `null` se não
   * havia imagem ativa.
   */
  removeActiveImage(groupId: string, actorId: string): Promise<Group | null>;
}
