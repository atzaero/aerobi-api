import { ApiProperty } from '@nestjs/swagger';

import { UserRole } from '@/generated/prisma/client';

export class MeResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'email' })
  email!: string;

  @ApiProperty({ enum: UserRole })
  role!: UserRole;
}
