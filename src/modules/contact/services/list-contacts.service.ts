import { Inject, Injectable } from '@nestjs/common';

import { resolvePaginationParams } from '@/common/utils/pagination-params.util';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';

import { CONTACT_LIST_MAX_LIMIT } from '../constants/contact-list.constants';
import { ContactsPaginatedResponseDTO } from '../dtos/contacts-paginated-response.dto';
import type { ListContactsQueryDTO } from '../dtos/list-contacts-query.dto';
import { ContactMapper } from '../mappers/contact.mapper';
import {
  CONTACT_REPOSITORY,
  type IContactRepository,
} from '../repositories/contact.repository.interface';
import { assertContactDateRangeValid } from '../utils/assert-contact-date-range.util';
import type { ContactListFilters } from '../utils/build-contact-filters.util';

@Injectable()
export class ListContactsService {
  constructor(
    @Inject(CONTACT_REPOSITORY)
    private readonly repo: IContactRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    query: ListContactsQueryDTO,
  ): Promise<ContactsPaginatedResponseDTO> {
    assertContactDateRangeValid(
      query.startDate,
      query.endDate,
      this.errorMessageService,
    );

    const { page, limit, skip } = resolvePaginationParams(
      query,
      CONTACT_LIST_MAX_LIMIT,
    );
    const filters: ContactListFilters = {
      type: query.type,
      status: query.status,
      email: query.email,
      phone: query.phone,
      startDate: query.startDate,
      endDate: query.endDate,
    };

    const [items, total] = await Promise.all([
      this.repo.findMany(filters, skip, limit),
      this.repo.count(filters),
    ]);

    return new ContactsPaginatedResponseDTO(
      ContactMapper.toApiRows(items),
      page,
      limit,
      total,
    );
  }
}
