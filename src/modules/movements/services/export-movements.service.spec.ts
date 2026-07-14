import { EXPORT_MAX_ROWS } from '@/common/utils/csv.util';

import type { MovementWithSnapshot } from '../mappers/movement.mapper';
import type { MovementRepository } from '../repositories/movement.repository';

import { ExportMovementsService } from './export-movements.service';

const HEADER =
  '﻿Matrícula,Aeródromo,Data/hora da leitura,Tipo de operação,Origem,Conformidade,Status,Comentários,Criado em';

describe('ExportMovementsService', () => {
  let service: ExportMovementsService;
  let findMany: jest.Mock;
  let count: jest.Mock;

  const entity = (
    over: Partial<MovementWithSnapshot> = {},
  ): MovementWithSnapshot =>
    ({
      id: 'r-1',
      registration: 'PRZTT',
      readingDatetime: new Date('2026-06-08T16:52:39.000Z'),
      operationType: 'LANDING',
      source: 'AUTOMATIC',
      conformityStatus: 'PENDING',
      readingStatus: 'APPROVED',
      comments: 'ok',
      aerodrome: 'SSCF',
      aircraftSnapshot: null,
      createdAt: new Date('2026-06-08T16:52:40.000Z'),
      ...over,
    }) as MovementWithSnapshot;

  beforeEach(() => {
    findMany = jest.fn();
    count = jest.fn();
    const repo = { findMany, count } as unknown as MovementRepository;
    service = new ExportMovementsService(repo);
  });

  it('busca MAX+1 sem paginação; CSV com cabeçalho pt-BR + linha (shape rico), sem truncar nem contar', async () => {
    findMany.mockResolvedValue([entity()]);

    const { csv, truncated, total } = await service.execute({});

    expect(findMany).toHaveBeenCalledWith({}, 0, EXPORT_MAX_ROWS + 1);
    expect(count).not.toHaveBeenCalled();
    expect(total).toBe(1);
    expect(truncated).toBe(false);

    const lines = csv.split('\r\n');
    /** Cabeçalho espelha o CSV do aerobi-web (com BOM UTF-8 no início). */
    expect(lines[0]).toBe(HEADER);
    expect(lines[1]).toBe(
      'PRZTT,SSCF,2026-06-08T16:52:39.000Z,Pouso,Automático,Pendente,APPROVED,ok,2026-06-08T16:52:40.000Z',
    );
  });

  it('trunca em EXPORT_MAX_ROWS e sinaliza truncated + total real (count best-effort)', async () => {
    const warn = jest.spyOn(service['logger'], 'warn').mockImplementation();
    const one = entity();
    findMany.mockResolvedValue(
      Array.from({ length: EXPORT_MAX_ROWS + 1 }, () => one),
    );
    count.mockResolvedValue(73_000);

    const { csv, truncated, total } = await service.execute({});

    expect(csv.split('\r\n')).toHaveLength(1 + EXPORT_MAX_ROWS);
    expect(truncated).toBe(true);
    expect(total).toBe(73_000);
    expect(warn).toHaveBeenCalled();
  });

  it('truncado com count falhando: cai em EXPORT_MAX_ROWS sem derrubar o export', async () => {
    jest.spyOn(service['logger'], 'warn').mockImplementation();
    const one = entity();
    findMany.mockResolvedValue(
      Array.from({ length: EXPORT_MAX_ROWS + 1 }, () => one),
    );
    count.mockRejectedValue(new Error('db timeout'));

    const { truncated, total } = await service.execute({});

    expect(truncated).toBe(true);
    expect(total).toBe(EXPORT_MAX_ROWS);
  });

  it('normaliza o filtro de matrícula para a forma canônica no where', async () => {
    let captured: Record<string, unknown> = {};
    findMany.mockImplementation((where: Record<string, unknown>) => {
      captured = where;
      return Promise.resolve([]);
    });

    await service.execute({ registration: 'PR-ZTT' });

    expect(captured.registration).toBe('PRZTT');
  });

  it('cabeçalho presente mesmo sem linhas', async () => {
    findMany.mockResolvedValue([]);

    const { csv, total, truncated } = await service.execute({});

    expect(total).toBe(0);
    expect(truncated).toBe(false);
    expect(csv).toBe(HEADER);
  });
});
