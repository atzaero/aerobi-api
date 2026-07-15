import type { Request, Response } from 'express';

import type { CreateContactService } from '../services/create-contact.service';
import { buildCreateContactDto } from '../testing/create-contact.dto.fixture';

import { CreateContactController } from './create-contact.controller';

describe('CreateContactController', () => {
  let controller: CreateContactController;
  let execute: jest.Mock;
  let status: jest.Mock;
  let res: Response;

  const request = {
    headers: { 'x-forwarded-for': '203.0.113.10' },
    ip: '203.0.113.10',
  } as unknown as Request;

  beforeEach(() => {
    execute = jest.fn();
    status = jest.fn();
    res = { status } as unknown as Response;
    controller = new CreateContactController({
      execute,
    } as unknown as CreateContactService);
  });

  it('sucesso real: seta 201 e retorna o { id } do service', async () => {
    execute.mockResolvedValue({ id: 'contact-1' });
    const dto = buildCreateContactDto();

    const out = await controller.handle(dto, request, res);

    expect(out).toEqual({ id: 'contact-1' });
    expect(execute).toHaveBeenCalledWith(dto, '203.0.113.10');
    expect(status).toHaveBeenCalledWith(201);
  });

  it('supressão anti-abuso: seta 202 e retorna vazio quando o service devolve null', async () => {
    execute.mockResolvedValue(null);
    const dto = buildCreateContactDto();

    const out = await controller.handle(dto, request, res);

    expect(out).toBeUndefined();
    expect(status).toHaveBeenCalledWith(202);
  });
});
