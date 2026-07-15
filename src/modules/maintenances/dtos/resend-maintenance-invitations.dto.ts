import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEmail } from 'class-validator';

/**
 * Body para POST /maintenances/:id/resend-invitations.
 */
export class ResendMaintenanceInvitationsDTO {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true })
  emails!: string[];
}

/**
 * Resultado do reenvio de convites.
 */
export class ResendMaintenanceInvitationsResponseDTO {
  @ApiProperty({ type: [String] })
  sent!: string[];

  @ApiProperty({ type: [String] })
  failed!: string[];
}
