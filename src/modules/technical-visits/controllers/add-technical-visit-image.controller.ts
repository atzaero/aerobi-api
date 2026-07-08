import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { buildAuditContext } from '@/modules/audit/utils/audit-context.util';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { RequiresGroupScope } from '@/modules/auth/decorators/requires-group-scope.decorator';
import { GroupScopeGuard } from '@/modules/auth/guards/group-scope.guard';
import { GroupScopeSubject } from '@/modules/auth/guards/group-scope.subject';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { AddTechnicalVisitImageDocs } from '../docs/add-technical-visit-image.docs';
import { AddTechnicalVisitImageBodyDTO } from '../dtos/add-technical-visit-image-body.dto';
import { TechnicalVisitImageResponseDTO } from '../dtos/technical-visit-image-response.dto';
import { TechnicalVisitParamDTO } from '../dtos/technical-visit-param.dto';
import { AddTechnicalVisitImageService } from '../services/add-technical-visit-image.service';
import { MAX_TECHNICAL_VISIT_IMAGE_BYTES } from '../utils/technical-visit-image';

@ApiTags('Technical Visits')
@Controller('technical-visits')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class AddTechnicalVisitImageController {
  constructor(private readonly service: AddTechnicalVisitImageService) {}

  @Post(':technicalVisitId/images')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission('technical_visit', 'update')
  @RequiresGroupScope(GroupScopeSubject.TECHNICAL_VISIT, 'technicalVisitId')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: MAX_TECHNICAL_VISIT_IMAGE_BYTES },
    }),
  )
  @AddTechnicalVisitImageDocs()
  handle(
    @Param() params: TechnicalVisitParamDTO,
    @Body() body: AddTechnicalVisitImageBodyDTO,
    @UploadedFile() image: Express.Multer.File | undefined,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<TechnicalVisitImageResponseDTO> {
    return this.service.execute(
      params.technicalVisitId,
      body.section,
      image,
      actor,
      buildAuditContext(actor, request),
    );
  }
}
