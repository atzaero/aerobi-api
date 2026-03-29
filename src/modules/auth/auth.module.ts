import { Global, Module } from '@nestjs/common';

import { FirebaseAdminService } from './services/firebase-admin.service';

@Global()
@Module({
  providers: [FirebaseAdminService],
  exports: [FirebaseAdminService],
})
export class AuthModule {}
