import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { CreateFeedbackDocs } from '../docs/create-feedback.docs';
import { FeedbackResponseDTO } from '../dtos/feedback-response.dto';
import { CreateFeedbackDTO } from '../dtos/create-feedback.dto';
import { CreateFeedbackService } from '../services/create-feedback.service';

@ApiTags('Feedbacks')
@Controller('feedbacks')
@UseGuards(AerobiApiKeyGuard)
export class CreateFeedbackController {
  constructor(private readonly service: CreateFeedbackService) {}

  @Post()
  @CreateFeedbackDocs()
  handle(@Body() dto: CreateFeedbackDTO): Promise<FeedbackResponseDTO> {
    return this.service.execute(dto);
  }
}
