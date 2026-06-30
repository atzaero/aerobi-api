import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Uf, UserRole } from '@/generated/prisma/client';

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'email' })
  email!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  phone!: string | null;

  @ApiProperty({ enum: UserRole })
  role!: UserRole;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  groupId!: string | null;

  @ApiPropertyOptional({ enum: Uf, nullable: true })
  state!: Uf | null;

  @ApiProperty()
  emailVerified!: boolean;

  @ApiPropertyOptional({ nullable: true })
  timezone!: string | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  lastLoginAt!: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  invitedById!: string | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  invitedAt!: string | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  acceptedInviteAt!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}
