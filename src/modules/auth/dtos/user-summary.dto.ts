import { ApiProperty } from '@nestjs/swagger';

import { UserRole } from '@/generated/prisma/client';

/** Resumo do usuário retornado junto a tokens (login). */
export class UserSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'email' })
  email!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: UserRole })
  role!: UserRole;
}
