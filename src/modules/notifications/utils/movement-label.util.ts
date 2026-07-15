import { MovementType } from '@/generated/prisma/enums';

/**
 * Rótulos em português para apresentação de movimentos nas mensagens. Centraliza
 * a tradução do enum {@link MovementType} para texto exibível ao coordenador.
 */
export function movementTypeLabel(operationType: string): string {
  switch (operationType) {
    case MovementType.LANDING:
      return 'pouso';
    case MovementType.TAKEOFF:
      return 'decolagem';
    default:
      return 'movimento';
  }
}
