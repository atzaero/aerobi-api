import type { Contact } from '@/generated/prisma/client';

import { ContactResponseDTO } from '../dtos/contact-response.dto';

export class ContactMapper {
  static toApiRow(entity: Contact): ContactResponseDTO {
    const row = new ContactResponseDTO();
    row.id = entity.id;
    row.email = entity.email;
    row.name = entity.name;
    row.phone = entity.phone;
    row.message = entity.message;
    row.type = entity.type;
    row.status = entity.status;
    row.createdAt = entity.createdAt.toISOString();
    row.updatedAt = entity.updatedAt.toISOString();
    row.updatedBy = entity.updatedBy;
    row.createdBy = entity.createdBy;
    return row;
  }

  static toApiRows(entities: Contact[]): ContactResponseDTO[] {
    return entities.map((entity) => ContactMapper.toApiRow(entity));
  }
}
