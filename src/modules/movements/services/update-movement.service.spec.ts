import { HttpStatus } from '@nestjs/common';

import { MovementSource, MovementType } from '@/generated/prisma/enums';

import { ErrorCode } from '@/common/enums/error-code.enum';
import type { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { StorageService } from '@/modules/storage/services/storage.service';

import type { RabRow } from '@/generated/prisma/client';
import type { RabRowRepository } from '@/modules/rab/repositories/rab-row.repository';

import type { MovementWithSnapshot } from '../mappers/movement.mapper';
import type { MovementRepository } from '../repositories/movement.repository';

import { UpdateMovementService } from './update-movement.service';

describe('UpdateMovementService', () => {
  let service: UpdateMovementService;
  let findById: jest.Mock;
  let updateRegistration: jest.Mock;
  let getPresignedUrl: jest.Mock;
  let getMessage: jest.Mock;
  let findLatestByMarcas: jest.Mock;

  const existing = {
    id: 'm-1',
    registration: 'PRXXX',
    imageKey: null,
    aircraftSnapshot: null,
  } as unknown as MovementWithSnapshot;

  const updated = {
    id: 'm-1',
    registration: 'PRZTT',
    operationType: MovementType.LANDING,
    source: MovementSource.AUTOMATIC,
    readingDatetime: new Date('2026-06-08T16:52:39Z'),
    readingStatus: null,
    revisorId: null,
    imageKey: null,
    comments: null,
    aerodrome: 'SSCF',
    aircraftSnapshot: null,
    createdAt: new Date('2026-06-08T16:52:39Z'),
    updatedAt: new Date('2026-06-08T17:00:00Z'),
  } as unknown as MovementWithSnapshot;

  beforeEach(() => {
    findById = jest.fn().mockResolvedValue(existing);
    updateRegistration = jest.fn().mockResolvedValue(updated);
    getPresignedUrl = jest.fn();
    getMessage = jest.fn().mockReturnValue('não encontrado');
    /** Por padrão sem match RAB; testes específicos sobrescrevem. */
    findLatestByMarcas = jest.fn().mockResolvedValue(null);

    const repo = {
      findById,
      updateRegistration,
    } as unknown as MovementRepository;
    const storage = { getPresignedUrl } as unknown as StorageService;
    const errors = { getMessage } as unknown as ErrorMessageService;
    const rabRowRepo = { findLatestByMarcas } as unknown as RabRowRepository;

    service = new UpdateMovementService(repo, storage, errors, rabRowRepo);
  });

  it('normaliza a matrícula para a forma canônica antes de persistir', async () => {
    await service.execute({
      id: 'm-1',
      registration: 'pr ztt',
      updatedBy: 'system',
    });

    expect(findLatestByMarcas).toHaveBeenCalledWith('PRZTT');
    expect(updateRegistration).toHaveBeenCalledWith(
      'm-1',
      'PRZTT',
      expect.any(Object),
      'system',
    );
  });

  it('re-resolve o snapshot RAB para a matrícula corrigida', async () => {
    const rabRow = {
      id: 'rab-1',
      period: '2026-06',
      marcas: 'PRZTT',
      dsModelo: 'EMB-202',
    } as unknown as RabRow;
    findLatestByMarcas.mockResolvedValue(rabRow);

    await service.execute({
      id: 'm-1',
      registration: 'PR-ZTT',
      updatedBy: 'system',
    });

    const snapshotArg = (updateRegistration.mock.calls[0] as unknown[])[2] as {
      rabRowId: string | null;
      marcas: string | null;
    };
    expect(snapshotArg.rabRowId).toBe('rab-1');
    expect(snapshotArg.marcas).toBe('PRZTT');
  });

  it('grava snapshot vazio quando não há linha RAB correspondente', async () => {
    findLatestByMarcas.mockResolvedValue(null);

    await service.execute({
      id: 'm-1',
      registration: 'PR-ZTT',
      updatedBy: 'system',
    });

    const snapshotArg = (updateRegistration.mock.calls[0] as unknown[])[2] as {
      rabRowId: string | null;
      marcas: string | null;
    };
    expect(snapshotArg.rabRowId).toBeNull();
    expect(snapshotArg.marcas).toBeNull();
  });

  it('retorna o movimento atualizado mapeado', async () => {
    const res = await service.execute({
      id: 'm-1',
      registration: 'PR-ZTT',
      updatedBy: 'system',
    });

    expect(res.id).toBe('m-1');
    expect(res.registration).toBe('PRZTT');
  });

  it('lança 404 quando o movimento não existe', async () => {
    findById.mockResolvedValue(null);

    expect.assertions(4);
    try {
      await service.execute({
        id: 'missing',
        registration: 'PR-ZTT',
        updatedBy: 'system',
      });
    } catch (e) {
      expect(e).toBeInstanceOf(CustomHttpException);
      expect((e as CustomHttpException).getStatus()).toBe(HttpStatus.NOT_FOUND);
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    expect(updateRegistration).not.toHaveBeenCalled();
  });
});
