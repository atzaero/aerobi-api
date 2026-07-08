import { Injectable } from '@nestjs/common';

import { TechnicalVisitImageResponseDTO } from '../dtos/technical-visit-image-response.dto';
import { TechnicalVisitImageMapper } from '../mappers/technical-visit-image.mapper';
import { TechnicalVisitImageRepository } from '../repositories/technical-visit-image.repository';
import { StorageService } from '@/modules/storage/services/storage.service';

@Injectable()
export class ListTechnicalVisitImagesService {
  constructor(
    private readonly imageRepo: TechnicalVisitImageRepository,
    private readonly storage: StorageService,
  ) {}

  async execute(
    technicalVisitId: string,
  ): Promise<TechnicalVisitImageResponseDTO[]> {
    const images = await this.imageRepo.findByVisitId(technicalVisitId);
    return TechnicalVisitImageMapper.toApiRows(this.storage, images);
  }
}
