/**
 * Registry dos templates de email do Aerobi — 1 arquivo por template
 * (`*.template.ts`), todos compostos com o layout/átomos de
 * `src/common/email/components` (coesão visual por construção).
 *
 * Placeholders usam o formato `[VARIABLE]` e são substituídos pelas chaves do
 * objeto `variables` passado em `EmailService.send()` (escapadas por padrão,
 * salvo as listadas em `rawKeys` — ver `EmailTemplateDefinition`).
 */

import {
  ContactReceiptVariables,
  contactReceiptTemplate,
} from './contact-receipt.template';
import {
  EmailChangedVariables,
  emailChangedTemplate,
} from './email-changed.template';
import { EmailTemplateDefinition } from './email-template.types';
import {
  GenericNotificationVariables,
  genericNotificationTemplate,
} from './generic-notification.template';
import { InviteVariables, inviteTemplate } from './invite.template';
import {
  LandingNonConformityVariables,
  landingNonConformityTemplate,
} from './landing-non-conformity.template';
import {
  LandingRequestDecidedVariables,
  landingRequestDecidedTemplate,
} from './landing-request-decided.template';
import {
  LandingRequestReceiptVariables,
  landingRequestReceiptTemplate,
} from './landing-request-receipt.template';
import {
  LandingRequestStaffVariables,
  landingRequestStaffTemplate,
} from './landing-request-staff.template';
import {
  MaintenanceInvitationVariables,
  maintenanceInvitationTemplate,
} from './maintenance-invitation.template';
import {
  PasswordResetVariables,
  passwordResetTemplate,
} from './password-reset.template';

export const templates = {
  generic_notification: genericNotificationTemplate,
  invite: inviteTemplate,
  password_reset: passwordResetTemplate,
  email_changed: emailChangedTemplate,
  landing_non_conformity: landingNonConformityTemplate,
  contact_receipt: contactReceiptTemplate,
  landing_request_receipt: landingRequestReceiptTemplate,
  landing_request_staff: landingRequestStaffTemplate,
  landing_request_decided: landingRequestDecidedTemplate,
  maintenance_invitation: maintenanceInvitationTemplate,
} as const satisfies Record<string, EmailTemplateDefinition>;

export type EmailTemplate = keyof typeof templates;

/**
 * Variáveis aceitas por cada template — consumido por
 * `EmailService.send<T>()` para checar as chaves em compile-time.
 */
export interface TemplateVariables {
  generic_notification: GenericNotificationVariables;
  invite: InviteVariables;
  password_reset: PasswordResetVariables;
  email_changed: EmailChangedVariables;
  landing_non_conformity: LandingNonConformityVariables;
  contact_receipt: ContactReceiptVariables;
  landing_request_receipt: LandingRequestReceiptVariables;
  landing_request_staff: LandingRequestStaffVariables;
  landing_request_decided: LandingRequestDecidedVariables;
  maintenance_invitation: MaintenanceInvitationVariables;
}

export type { EmailTemplateDefinition } from './email-template.types';
