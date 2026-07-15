import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';
import { extractIpAddress } from '@/common/utils/extract-ip-address.util';

import { CreateContactDocs } from '../docs/create-contact.docs';
import { CreateContactResponseDTO } from '../dtos/create-contact-response.dto';
import { CreateContactDTO } from '../dtos/create-contact.dto';
import { CreateContactService } from '../services/create-contact.service';

@ApiTags('Contact')
@Controller('contact')
@UseGuards(AerobiApiKeyGuard)
export class CreateContactController {
  constructor(private readonly service: CreateContactService) {}

  @Post()
  @CreateContactDocs()
  async handle(
    @Body() dto: CreateContactDTO,
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CreateContactResponseDTO | void> {
    const result = await this.service.execute(dto, extractIpAddress(request));
    if (result === null) {
      res.status(202);
      return;
    }
    res.status(201);
    return result;
  }
}
