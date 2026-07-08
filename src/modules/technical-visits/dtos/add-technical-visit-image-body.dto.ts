import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { TechnicalVisitImageSection } from '@/generated/prisma/client';

export class AddTechnicalVisitImageBodyDTO {
  @ApiProperty({
    enum: TechnicalVisitImageSection,
    example: TechnicalVisitImageSection.fence,
  })
  @IsEnum(TechnicalVisitImageSection)
  section!: TechnicalVisitImageSection;
}
