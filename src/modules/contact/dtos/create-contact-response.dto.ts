import { ApiProperty } from '@nestjs/swagger';

/** Resposta de sucesso do `POST /contact` (201). */
export class CreateContactResponseDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;
}
