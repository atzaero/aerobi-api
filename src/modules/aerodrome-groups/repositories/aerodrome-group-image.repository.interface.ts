/** Dados de uma nova imagem de grupo (a key já foi enviada ao storage). */
export interface CreateAerodromeGroupImageInput {
  groupId: string;
  imageKey: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  actorId: string;
}

export interface IAerodromeGroupImageRepository {
  /**
   * Transação que mantém **1 imagem ativa por grupo**: cria a nova imagem,
   * soft-deleta as anteriores ativas e sincroniza `group.imageKey`.
   */
  createActiveImage(input: CreateAerodromeGroupImageInput): Promise<void>;

  /**
   * Transação que remove a imagem ativa, recomputa a próxima ativa e
   * ressincroniza `group.imageKey`. Retorna `false` se não havia imagem ativa.
   */
  removeActiveImage(groupId: string, actorId: string): Promise<boolean>;
}
