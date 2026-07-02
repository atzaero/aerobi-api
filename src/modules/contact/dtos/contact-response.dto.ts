import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContactMessageStatus, ContactType } from '@/generated/prisma/client';

export class ContactResponseDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'email' })
  email!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  phone!: string;

  @ApiProperty()
  message!: string;

  @ApiProperty({ enum: ContactType })
  type!: ContactType;

  @ApiProperty({ enum: ContactMessageStatus })
  status!: ContactMessageStatus;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;

  @ApiPropertyOptional({ nullable: true })
  updatedBy!: string | null;

  @ApiPropertyOptional({ nullable: true })
  createdBy!: string | null;
}
