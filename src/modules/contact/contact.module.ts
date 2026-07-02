import { Module } from '@nestjs/common';

import { EmailModule } from '@/common/email/email.module';
import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';
import { AuthModule } from '@/modules/auth/auth.module';

import { CreateContactController } from './controllers/create-contact.controller';
import { ExportContactsController } from './controllers/export-contacts.controller';
import { ListContactsController } from './controllers/list-contacts.controller';
import { RemoveContactController } from './controllers/remove-contact.controller';
import { UpdateContactStatusController } from './controllers/update-contact-status.controller';
import { ContactReceiptEmailListener } from './listeners/contact-receipt-email.listener';
import { ContactRepository } from './repositories/contact.repository';
import { CONTACT_REPOSITORY } from './repositories/contact.repository.interface';
import { CreateContactService } from './services/create-contact.service';
import { EvaluateContactSubmissionGuardsService } from './services/evaluate-contact-submission-guards.service';
import { ExportContactsService } from './services/export-contacts.service';
import { ListContactsService } from './services/list-contacts.service';
import { RemoveContactService } from './services/remove-contact.service';
import { UpdateContactStatusService } from './services/update-contact-status.service';

@Module({
  imports: [AuthModule, EmailModule],
  controllers: [
    CreateContactController,
    ListContactsController,
    ExportContactsController,
    UpdateContactStatusController,
    RemoveContactController,
  ],
  providers: [
    AerobiApiKeyGuard,
    { provide: CONTACT_REPOSITORY, useClass: ContactRepository },
    EvaluateContactSubmissionGuardsService,
    CreateContactService,
    ListContactsService,
    ExportContactsService,
    UpdateContactStatusService,
    RemoveContactService,
    ContactReceiptEmailListener,
  ],
})
export class ContactModule {}
