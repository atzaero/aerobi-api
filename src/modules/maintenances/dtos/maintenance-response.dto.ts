import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Resposta de uma intervenção (detalhe).
 */
export class MaintenanceResponseDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ format: 'uuid' })
  aerodromeId!: string;

  @ApiProperty({ example: 'PI' })
  uf!: string;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Null quando não há e-mails autorizados (acesso público off).',
  })
  securityCode!: string | null;

  @ApiProperty({ type: [String] })
  authorizedEmails!: string[];

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

/**
 * Item enriquecido da listagem com contagem de tarefas em atraso.
 */
export class MaintenanceListItemResponseDTO extends MaintenanceResponseDTO {
  @ApiProperty()
  overduePendingCount!: number;

  @ApiProperty()
  overdueCompletedCount!: number;
}

/**
 * Resposta da criação — expõe o código de segurança uma única vez.
 */
export class CreateMaintenanceResponseDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  aerodromeId!: string;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Null quando não há e-mails autorizados.',
  })
  securityCode!: string | null;
}

/**
 * Resposta da atualização — código após a edição.
 */
export class UpdateMaintenanceResponseDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Null quando não há e-mails autorizados.',
  })
  securityCode!: string | null;
}

/**
 * Resposta do soft-delete em cascata.
 */
export class MaintenanceDeletionResponseDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  deletedTasks!: number;
}
