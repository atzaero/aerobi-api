import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional } from 'class-validator';

/**
 * Query para `GET /public/maintenances/:id/feedback`.
 */
export class PublicMaintenanceFeedbackQueryDTO {
  @ApiPropertyOptional({ format: 'email' })
  @IsOptional()
  @IsEmail()
  email?: string;
}
