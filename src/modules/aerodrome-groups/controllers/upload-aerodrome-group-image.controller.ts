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
import { RequiresGroupScope } from '@/modules/auth/decorators/requires-group-scope.decorator';
import { GroupScopeGuard } from '@/modules/auth/guards/group-scope.guard';
import { GroupScopeSubject } from '@/modules/auth/guards/group-scope.subject';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { UploadAerodromeGroupImageDocs } from '../docs/upload-aerodrome-group-image.docs';
import { AerodromeGroupParamDTO } from '../dtos/aerodrome-group-param.dto';
import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import { UploadAerodromeGroupImageService } from '../services/upload-aerodrome-group-image.service';
import { MAX_GROUP_IMAGE_SIZE_BYTES } from '../utils/aerodrome-group-image';

@ApiTags('Aerodrome Groups')
@Controller('aerodrome-groups')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class UploadAerodromeGroupImageController {
  constructor(private readonly service: UploadAerodromeGroupImageService) {}

  @Post(':id/image')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('group', 'update')
  @RequiresGroupScope(GroupScopeSubject.AERODROME_GROUP)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: MAX_GROUP_IMAGE_SIZE_BYTES },
    }),
  )
  @UploadAerodromeGroupImageDocs()
  handle(
    @Param() { id }: AerodromeGroupParamDTO,
    @UploadedFile() image: Express.Multer.File | undefined,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<AerodromeGroupResponseDTO> {
    return this.service.execute(id, image, actor);
  }
}
