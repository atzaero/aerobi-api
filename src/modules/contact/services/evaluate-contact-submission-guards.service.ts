import { Inject, Injectable } from '@nestjs/common';

import { hashRequestIpForRateLimit } from '@/common/utils/hash-request-ip.util';

import type { CreateContactDTO } from '../dtos/create-contact.dto';
import {
  CONTACT_REPOSITORY,
  type IContactRepository,
} from '../repositories/contact.repository.interface';
import { resolveContactDate } from '../utils/contact-date.util';
import {
  isContactFormFilledTooFast,
  isContactFormOpenedTooOld,
  isContactHoneypotTripped,
  MAX_SUBMISSIONS_PER_IP_PER_DAY,
} from '../utils/contact-submit.util';

export interface ContactSubmissionGuardResult {
  suppressed: boolean;
  date: string;
  ipHash: string | null;
  normalizedEmail: string;
}

@Injectable()
export class EvaluateContactSubmissionGuardsService {
  constructor(
    @Inject(CONTACT_REPOSITORY)
    private readonly repo: IContactRepository,
  ) {}

  async execute(
    dto: CreateContactDTO,
    ipAddress: string | undefined,
    serverNowMs: number = Date.now(),
  ): Promise<ContactSubmissionGuardResult> {
    const date = resolveContactDate(new Date(serverNowMs));
    const ipHash = hashRequestIpForRateLimit(ipAddress ?? null);
    const normalizedEmail = dto.email;

    if (isContactHoneypotTripped(dto.website)) {
      return { suppressed: true, date, ipHash, normalizedEmail };
    }

    if (isContactFormFilledTooFast(dto.formOpenedAt, serverNowMs)) {
      return { suppressed: true, date, ipHash, normalizedEmail };
    }

    if (isContactFormOpenedTooOld(dto.formOpenedAt, serverNowMs)) {
      return { suppressed: true, date, ipHash, normalizedEmail };
    }

    if (
      await this.repo.hasActiveDuplicate('sessionHash', dto.sessionHash, date)
    ) {
      return { suppressed: true, date, ipHash, normalizedEmail };
    }

    if (await this.repo.hasActiveDuplicate('email', normalizedEmail, date)) {
      return { suppressed: true, date, ipHash, normalizedEmail };
    }

    if (ipHash) {
      const count = await this.repo.countActiveByIpHashAndDate(ipHash, date);
      if (count >= MAX_SUBMISSIONS_PER_IP_PER_DAY) {
        return { suppressed: true, date, ipHash, normalizedEmail };
      }
    }

    return { suppressed: false, date, ipHash, normalizedEmail };
  }
}
