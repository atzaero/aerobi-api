import { Inject, Injectable, Logger } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { EXPORT_MAX_ROWS, toCsv } from '@/common/utils/csv.util';
import { getErrorMessage } from '@/common/utils/error.util';

import type { ExportContactsQueryDTO } from '../dtos/export-contacts-query.dto';
import { contactExportColumns } from '../mappers/contact-export.columns';
import {
  CONTACT_REPOSITORY,
  type IContactRepository,
} from '../repositories/contact.repository.interface';
import { assertContactDateRangeValid } from '../utils/assert-contact-date-range.util';
import type { ContactListFilters } from '../utils/build-contact-filters.util';

export interface ExportContactsResult {
  csv: string;
  truncated: boolean;
  total: number;
}

@Injectable()
export class ExportContactsService {
  private readonly logger = new Logger(ExportContactsService.name);

  constructor(
    @Inject(CONTACT_REPOSITORY)
    private readonly repo: IContactRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(query: ExportContactsQueryDTO): Promise<ExportContactsResult> {
    assertContactDateRangeValid(
      query.startDate,
      query.endDate,
      this.errorMessageService,
    );

    const filters: ContactListFilters = {
      type: query.type,
      status: query.status,
      email: query.email,
      phone: query.phone,
      startDate: query.startDate,
      endDate: query.endDate,
    };

    const rows = await this.repo.findManyForExport(
      filters,
      EXPORT_MAX_ROWS + 1,
    );

    if (rows.length > EXPORT_MAX_ROWS) {
      let total = EXPORT_MAX_ROWS;
      try {
        total = Math.max(
          await this.repo.countForExport(filters),
          EXPORT_MAX_ROWS,
        );
      } catch (err) {
        this.logger.warn(
          `count do total truncado falhou (best-effort): ${getErrorMessage(err)}`,
        );
      }
      this.logger.warn(
        `Export de contato truncado em ${EXPORT_MAX_ROWS} de ${total} linhas.`,
      );
      return {
        csv: toCsv(rows.slice(0, EXPORT_MAX_ROWS), contactExportColumns),
        truncated: true,
        total,
      };
    }

    return {
      csv: toCsv(rows, contactExportColumns),
      truncated: false,
      total: rows.length,
    };
  }
}
