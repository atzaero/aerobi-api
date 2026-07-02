import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';

import { ContactMessageStatus } from '@/generated/prisma/client';

/** Body `PATCH /contact/:id/status`. */
export class UpdateContactStatusDTO {
  @ApiProperty({ enum: ContactMessageStatus })
  @IsEnum(ContactMessageStatus)
  status!: ContactMessageStatus;
}

/** Param `:id` nas rotas de moderação. */
export class ContactParamDTO {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  id!: string;
}

/** Resposta mínima de update-status e delete (paridade web `{ id }`). */
export class ContactIdResponseDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;
}
