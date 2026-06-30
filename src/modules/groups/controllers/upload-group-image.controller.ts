import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { UploadGroupImageDocs } from '../docs/upload-group-image.docs';
import { GroupParamDTO } from '../dtos/group-param.dto';
import { GroupResponseDTO } from '../dtos/group-response.dto';
import { UploadGroupImageService } from '../services/upload-group-image.service';
import { MAX_GROUP_IMAGE_SIZE_BYTES } from '../utils/group-image';

@ApiTags('Groups')
@Controller('groups')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UploadGroupImageController {
  constructor(private readonly service: UploadGroupImageService) {}

  @Post(':id/image')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('group', 'update')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: MAX_GROUP_IMAGE_SIZE_BYTES },
    }),
  )
  @UploadGroupImageDocs()
  handle(
    @Param() { id }: GroupParamDTO,
    @UploadedFile() image: Express.Multer.File | undefined,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<GroupResponseDTO> {
    return this.service.execute(id, image, actor);
  }
}
