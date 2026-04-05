import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PlugfieldApiKeyGuard } from '@/common/guards/plugfield-api-key.guard';

import { PlugfieldLoginDocs } from '../docs/plugfield-login.docs';
import { PlugfieldLoginBodyDto } from '../dtos/plugfield-login-body.dto';
import { PlugfieldLoginService } from '../services/plugfield-login.service';

@ApiTags('Plugfield')
@Controller('plugfield')
@UseGuards(PlugfieldApiKeyGuard)
export class PlugfieldLoginController {
  constructor(private readonly plugfieldLogin: PlugfieldLoginService) {}

  @Post('login')
  @PlugfieldLoginDocs()
  async handle(
    @Body() body: PlugfieldLoginBodyDto,
  ): Promise<Record<string, unknown>> {
    return this.plugfieldLogin.execute({
      username: body.username,
      password: body.password,
    });
  }
}
