#!/usr/bin/env node
/**
 * Gera o scaffold de um módulo NestJS CRUD (create/update/list/find-by-id/remove)
 * seguindo o padrão do aerobi-api (ver src/modules/rab e src/modules/public-aerodromes).
 *
 * Uso:
 *   node scripts/scaffold-module.mjs <Model> <pasta-plural> <entidade-singular> <"Api Tag">
 *
 * Exemplo:
 *   node scripts/scaffold-module.mjs AerodromeGroup aerodrome-groups aerodrome-group "Aerodrome Groups"
 *
 * Falha se a pasta de destino já existe.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(__filename), '..');

const [, , Model, pluralKebab, singularKebab, apiTag] = process.argv;
if (!Model || !pluralKebab || !singularKebab || !apiTag) {
  console.error(
    'Uso: node scripts/scaffold-module.mjs <Model> <pasta-plural> <entidade-singular> <"Api Tag">',
  );
  process.exit(1);
}

const modulesDir = path.join(projectRoot, 'src', 'modules');
const moduleDir = path.join(modulesDir, pluralKebab);
if (fs.existsSync(moduleDir)) {
  console.error(`[scaffold] pasta já existe: ${moduleDir}`);
  process.exit(1);
}

// --- derivações de nome ---
const toPascal = (kebab) =>
  kebab
    .split('-')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('');
const toCamel = (kebab) => {
  const p = toPascal(kebab);
  return p[0].toLowerCase() + p.slice(1);
};

const names = {
  Model, // AerodromeGroup (model Prisma)
  singularKebab, // aerodrome-group
  pluralKebab, // aerodrome-groups
  pascalSingular: toPascal(singularKebab), // AerodromeGroup
  pascalPlural: toPascal(pluralKebab), // AerodromeGroups
  camelSingular: toCamel(singularKebab), // aerodromeGroup
  apiTag, // "Aerodrome Groups"
};

// --- helper ---
const writeFile = (relPath, content) => {
  const full = path.join(moduleDir, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log(`  + ${path.relative(projectRoot, full)}`);
};

// =========================================================================
// Controllers
// =========================================================================
const controllerCreate = (n) => `import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { Create${n.pascalSingular}Docs } from '../docs/create-${n.singularKebab}.docs';
import { ${n.pascalSingular}ResponseDTO } from '../dtos/${n.singularKebab}-response.dto';
import { Create${n.pascalSingular}DTO } from '../dtos/create-${n.singularKebab}.dto';
import { Create${n.pascalSingular}Service } from '../services/create-${n.singularKebab}.service';

@ApiTags('${n.apiTag}')
@Controller('${n.pluralKebab}')
@UseGuards(AerobiApiKeyGuard)
export class Create${n.pascalSingular}Controller {
  constructor(private readonly service: Create${n.pascalSingular}Service) {}

  @Post()
  @Create${n.pascalSingular}Docs()
  handle(@Body() dto: Create${n.pascalSingular}DTO): Promise<${n.pascalSingular}ResponseDTO> {
    return this.service.execute(dto);
  }
}
`;

const controllerUpdate = (n) => `import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { Update${n.pascalSingular}Docs } from '../docs/update-${n.singularKebab}.docs';
import { ${n.pascalSingular}ResponseDTO } from '../dtos/${n.singularKebab}-response.dto';
import { Update${n.pascalSingular}DTO } from '../dtos/update-${n.singularKebab}.dto';
import { Update${n.pascalSingular}Service } from '../services/update-${n.singularKebab}.service';

@ApiTags('${n.apiTag}')
@Controller('${n.pluralKebab}')
@UseGuards(AerobiApiKeyGuard)
export class Update${n.pascalSingular}Controller {
  constructor(private readonly service: Update${n.pascalSingular}Service) {}

  @Patch(':id')
  @Update${n.pascalSingular}Docs()
  handle(
    @Param('id') id: string,
    @Body() dto: Update${n.pascalSingular}DTO,
  ): Promise<${n.pascalSingular}ResponseDTO> {
    return this.service.execute({ id, ...dto });
  }
}
`;

const controllerList = (n) => `import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { List${n.pascalPlural}Docs } from '../docs/list-${n.pluralKebab}.docs';
import { List${n.pascalPlural}QueryDTO } from '../dtos/list-${n.pluralKebab}-query.dto';
import { ${n.pascalPlural}PaginatedResponseDTO } from '../dtos/${n.pluralKebab}-paginated-response.dto';
import { List${n.pascalPlural}Service } from '../services/list-${n.pluralKebab}.service';

@ApiTags('${n.apiTag}')
@Controller('${n.pluralKebab}')
@UseGuards(AerobiApiKeyGuard)
export class List${n.pascalPlural}Controller {
  constructor(private readonly service: List${n.pascalPlural}Service) {}

  @Get()
  @List${n.pascalPlural}Docs()
  handle(
    @Query() query: List${n.pascalPlural}QueryDTO,
  ): Promise<${n.pascalPlural}PaginatedResponseDTO> {
    return this.service.execute(query);
  }
}
`;

const controllerFindById = (n) => `import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { Find${n.pascalSingular}ByIdDocs } from '../docs/find-${n.singularKebab}-by-id.docs';
import { ${n.pascalSingular}ResponseDTO } from '../dtos/${n.singularKebab}-response.dto';
import { Find${n.pascalSingular}ByIdService } from '../services/find-${n.singularKebab}-by-id.service';

@ApiTags('${n.apiTag}')
@Controller('${n.pluralKebab}')
@UseGuards(AerobiApiKeyGuard)
export class Find${n.pascalSingular}ByIdController {
  constructor(private readonly service: Find${n.pascalSingular}ByIdService) {}

  @Get(':id')
  @Find${n.pascalSingular}ByIdDocs()
  handle(@Param('id') id: string): Promise<${n.pascalSingular}ResponseDTO> {
    return this.service.execute({ id });
  }
}
`;

const controllerRemove = (n) => `import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { Remove${n.pascalSingular}Docs } from '../docs/remove-${n.singularKebab}.docs';
import { ${n.pascalSingular}ResponseDTO } from '../dtos/${n.singularKebab}-response.dto';
import { Remove${n.pascalSingular}Service } from '../services/remove-${n.singularKebab}.service';

@ApiTags('${n.apiTag}')
@Controller('${n.pluralKebab}')
@UseGuards(AerobiApiKeyGuard)
export class Remove${n.pascalSingular}Controller {
  constructor(private readonly service: Remove${n.pascalSingular}Service) {}

  @Delete(':id')
  @Remove${n.pascalSingular}Docs()
  handle(@Param('id') id: string): Promise<${n.pascalSingular}ResponseDTO> {
    // TODO: obter deletedBy do contexto autenticado
    return this.service.execute({ id, deletedBy: 'system' });
  }
}
`;

// =========================================================================
// Controller specs — delegação a service.execute (alinhado a issue #81).
// =========================================================================

const SPEC_UUID = `'00000000-0000-4000-8000-000000000001'`;

const specControllerCreate = (
  n,
  fileBase,
  ServiceClass,
  ControllerClass,
) => `import { Create${n.pascalSingular}DTO } from '../dtos/create-${n.singularKebab}.dto';
import { ${n.pascalSingular}ResponseDTO } from '../dtos/${n.singularKebab}-response.dto';
import { ${ServiceClass} } from '../services/${fileBase}.service';

import { ${ControllerClass} } from './${fileBase}.controller';

describe('${ControllerClass}', () => {
  let controller: ${ControllerClass};
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ${ControllerClass}({
      execute,
    } as unknown as ${ServiceClass});
  });

  it('delega ao service.execute com o body', async () => {
    const dto = {} as Create${n.pascalSingular}DTO;
    const row = new ${n.pascalSingular}ResponseDTO();
    execute.mockResolvedValue(row);

    await expect(controller.handle(dto)).resolves.toBe(row);

    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledWith(dto);
  });
});
`;

const specControllerUpdate = (
  n,
  fileBase,
  ServiceClass,
  ControllerClass,
) => `import { Update${n.pascalSingular}DTO } from '../dtos/update-${n.singularKebab}.dto';
import { ${n.pascalSingular}ResponseDTO } from '../dtos/${n.singularKebab}-response.dto';
import { ${ServiceClass} } from '../services/${fileBase}.service';

import { ${ControllerClass} } from './${fileBase}.controller';

describe('${ControllerClass}', () => {
  let controller: ${ControllerClass};
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ${ControllerClass}({
      execute,
    } as unknown as ${ServiceClass});
  });

  it('delega PATCH ao service.execute com id e body', async () => {
    const id = ${SPEC_UUID};
    const body = {} as Update${n.pascalSingular}DTO;
    const row = new ${n.pascalSingular}ResponseDTO();
    execute.mockResolvedValue(row);

    await expect(controller.handle(id, body)).resolves.toBe(row);

    expect(execute).toHaveBeenCalledWith({ id, ...body });
  });
});
`;

const specControllerList = (
  n,
  fileBase,
  ServiceClass,
  ControllerClass,
) => `import { ${n.pascalPlural}PaginatedResponseDTO } from '../dtos/${n.pluralKebab}-paginated-response.dto';
import { List${n.pascalPlural}QueryDTO } from '../dtos/list-${n.pluralKebab}-query.dto';
import { ${ServiceClass} } from '../services/${fileBase}.service';

import { ${ControllerClass} } from './${fileBase}.controller';

describe('${ControllerClass}', () => {
  let controller: ${ControllerClass};
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ${ControllerClass}({
      execute,
    } as unknown as ${ServiceClass});
  });

  it('delega lista ao service.execute com query', async () => {
    const query = {} as List${n.pascalPlural}QueryDTO;
    const page = new ${n.pascalPlural}PaginatedResponseDTO([], 1, 10, 0);
    execute.mockResolvedValue(page);

    await expect(controller.handle(query)).resolves.toBe(page);

    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledWith(query);
  });
});
`;

const specControllerFindById = (
  n,
  fileBase,
  ServiceClass,
  ControllerClass,
) => `import { ${n.pascalSingular}ResponseDTO } from '../dtos/${n.singularKebab}-response.dto';
import { ${ServiceClass} } from '../services/${fileBase}.service';

import { ${ControllerClass} } from './${fileBase}.controller';

describe('${ControllerClass}', () => {
  let controller: ${ControllerClass};
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ${ControllerClass}({
      execute,
    } as unknown as ${ServiceClass});
  });

  it('delega ao service.execute com id do path', async () => {
    const id = ${SPEC_UUID};
    const row = new ${n.pascalSingular}ResponseDTO();
    execute.mockResolvedValue(row);

    await expect(controller.handle(id)).resolves.toBe(row);

    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledWith({ id });
  });
});
`;

const specControllerRemove = (
  n,
  fileBase,
  ServiceClass,
  ControllerClass,
) => `import { ${n.pascalSingular}ResponseDTO } from '../dtos/${n.singularKebab}-response.dto';
import { ${ServiceClass} } from '../services/${fileBase}.service';

import { ${ControllerClass} } from './${fileBase}.controller';

describe('${ControllerClass}', () => {
  let controller: ${ControllerClass};
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ${ControllerClass}({
      execute,
    } as unknown as ${ServiceClass});
  });

  it('delega DELETE ao service com deletedBy até existir auth', async () => {
    const id = ${SPEC_UUID};
    const row = new ${n.pascalSingular}ResponseDTO();
    execute.mockResolvedValue(row);

    await expect(controller.handle(id)).resolves.toBe(row);

    expect(execute).toHaveBeenCalledWith({ id, deletedBy: 'system' });
  });
});
`;

const specControllerWithOp = (n, fileBase, ServiceClass, ControllerClass) => {
  if (fileBase === `create-${n.singularKebab}`) {
    return specControllerCreate(n, fileBase, ServiceClass, ControllerClass);
  }
  if (fileBase === `update-${n.singularKebab}`) {
    return specControllerUpdate(n, fileBase, ServiceClass, ControllerClass);
  }
  if (fileBase === `list-${n.pluralKebab}`) {
    return specControllerList(n, fileBase, ServiceClass, ControllerClass);
  }
  if (fileBase === `find-${n.singularKebab}-by-id`) {
    return specControllerFindById(n, fileBase, ServiceClass, ControllerClass);
  }
  if (fileBase === `remove-${n.singularKebab}`) {
    return specControllerRemove(n, fileBase, ServiceClass, ControllerClass);
  }
  throw new Error(`specControllerWithOp: ficheiro base não reconhecido: ${fileBase}`);
};

const specControllerSimple = (n, opName, ServiceClass, ControllerClass) => `import { ${ServiceClass} } from '../services/${opName}-${opName.startsWith('list-') ? n.pluralKebab : n.singularKebab}.service';
import { ${ControllerClass} } from './${opName}-${opName.startsWith('list-') ? n.pluralKebab : n.singularKebab}.controller';

describe('${ControllerClass}', () => {
  let controller: ${ControllerClass};
  let service: jest.Mocked<Pick<${ServiceClass}, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new ${ControllerClass}(service as unknown as ${ServiceClass});
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
`;

// =========================================================================
// Services
// =========================================================================
const prismaMapperModule = (n) => `import type { Prisma } from '@/generated/prisma/client';

import { Create${n.pascalSingular}DTO } from '../dtos/create-${n.singularKebab}.dto';
import { Update${n.pascalSingular}DTO } from '../dtos/update-${n.singularKebab}.dto';

export function build${n.pascalSingular}CreateInput(
  dto: Create${n.pascalSingular}DTO,
): Prisma.${n.Model}CreateInput {
  // TODO: mapeamento explícito DTO → Prisma (campos escalares + relações connect/disconnect).
  return dto as never;
}

export function patch${n.pascalSingular}ToPrisma(
  dto: Update${n.pascalSingular}DTO,
): Prisma.${n.Model}UpdateInput {
  // TODO: só campos com !== undefined; relações via connect/disconnect.
  return dto as never;
}
`;

const serviceCreate = (n) => `import { Injectable } from '@nestjs/common';

import { ${n.pascalSingular}ResponseDTO } from '../dtos/${n.singularKebab}-response.dto';
import { Create${n.pascalSingular}DTO } from '../dtos/create-${n.singularKebab}.dto';
import { ${n.pascalSingular}Mapper } from '../mappers/${n.singularKebab}.mapper';
import { build${n.pascalSingular}CreateInput } from '../mappers/${n.singularKebab}.prisma.mapper';
import { ${n.pascalSingular}Repository } from '../repositories/${n.singularKebab}.repository';

@Injectable()
export class Create${n.pascalSingular}Service {
  constructor(private readonly repo: ${n.pascalSingular}Repository) {}

  async execute(dto: Create${n.pascalSingular}DTO): Promise<${n.pascalSingular}ResponseDTO> {
    const created = await this.repo.create(build${n.pascalSingular}CreateInput(dto));
    return ${n.pascalSingular}Mapper.toApiRow(created);
  }
}
`;

const serviceUpdate = (n) => `import { Injectable, NotFoundException } from '@nestjs/common';

import { ${n.pascalSingular}ResponseDTO } from '../dtos/${n.singularKebab}-response.dto';
import { Update${n.pascalSingular}DTO } from '../dtos/update-${n.singularKebab}.dto';
import { ${n.pascalSingular}Mapper } from '../mappers/${n.singularKebab}.mapper';
import { patch${n.pascalSingular}ToPrisma } from '../mappers/${n.singularKebab}.prisma.mapper';
import { ${n.pascalSingular}Repository } from '../repositories/${n.singularKebab}.repository';

export type Update${n.pascalSingular}ServiceInput = Update${n.pascalSingular}DTO & { id: string };

@Injectable()
export class Update${n.pascalSingular}Service {
  constructor(private readonly repo: ${n.pascalSingular}Repository) {}

  async execute(
    input: Update${n.pascalSingular}ServiceInput,
  ): Promise<${n.pascalSingular}ResponseDTO> {
    const { id, ...dto } = input;
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException(\`${n.pascalSingular} \${id} not found\`);
    }
    const updated = await this.repo.update(id, patch${n.pascalSingular}ToPrisma(dto));
    return ${n.pascalSingular}Mapper.toApiRow(updated);
  }
}
`;

const serviceList = (n) => `import { Injectable } from '@nestjs/common';

import { resolvePaginationParams } from '@/common/utils/pagination-params.util';

import { List${n.pascalPlural}QueryDTO } from '../dtos/list-${n.pluralKebab}-query.dto';
import { ${n.pascalPlural}PaginatedResponseDTO } from '../dtos/${n.pluralKebab}-paginated-response.dto';
import { ${n.pascalSingular}Mapper } from '../mappers/${n.singularKebab}.mapper';
import { ${n.pascalSingular}Repository } from '../repositories/${n.singularKebab}.repository';

const MAX_LIMIT = 200;

@Injectable()
export class List${n.pascalPlural}Service {
  constructor(private readonly repo: ${n.pascalSingular}Repository) {}

  async execute(
    query: List${n.pascalPlural}QueryDTO,
  ): Promise<${n.pascalPlural}PaginatedResponseDTO> {
    const { page, limit, skip } = resolvePaginationParams(query, MAX_LIMIT);
    // TODO: construir filtros where a partir da query
    const where = {};
    const [items, total] = await Promise.all([
      this.repo.findMany(where, skip, limit),
      this.repo.count(where),
    ]);
    const data = ${n.pascalSingular}Mapper.toApiRows(items);
    return new ${n.pascalPlural}PaginatedResponseDTO(data, page, limit, total);
  }
}
`;

const serviceFindById = (n) => `import { Injectable, NotFoundException } from '@nestjs/common';

import { ${n.pascalSingular}ResponseDTO } from '../dtos/${n.singularKebab}-response.dto';
import { ${n.pascalSingular}Mapper } from '../mappers/${n.singularKebab}.mapper';
import { ${n.pascalSingular}Repository } from '../repositories/${n.singularKebab}.repository';

export type Find${n.pascalSingular}ByIdServiceInput = { id: string };

@Injectable()
export class Find${n.pascalSingular}ByIdService {
  constructor(private readonly repo: ${n.pascalSingular}Repository) {}

  async execute(
    input: Find${n.pascalSingular}ByIdServiceInput,
  ): Promise<${n.pascalSingular}ResponseDTO> {
    // TODO: implementar
    const entity = await this.repo.findById(input.id);
    if (!entity) {
      throw new NotFoundException(\`${n.pascalSingular} \${input.id} not found\`);
    }
    return ${n.pascalSingular}Mapper.toApiRow(entity);
  }
}
`;

const serviceRemove = (n) => `import { Injectable, NotFoundException } from '@nestjs/common';

import { ${n.pascalSingular}ResponseDTO } from '../dtos/${n.singularKebab}-response.dto';
import { ${n.pascalSingular}Mapper } from '../mappers/${n.singularKebab}.mapper';
import { ${n.pascalSingular}Repository } from '../repositories/${n.singularKebab}.repository';

export type Remove${n.pascalSingular}ServiceInput = { id: string; deletedBy: string };

@Injectable()
export class Remove${n.pascalSingular}Service {
  constructor(private readonly repo: ${n.pascalSingular}Repository) {}

  async execute(
    input: Remove${n.pascalSingular}ServiceInput,
  ): Promise<${n.pascalSingular}ResponseDTO> {
    // TODO: implementar (soft delete)
    const existing = await this.repo.findById(input.id);
    if (!existing) {
      throw new NotFoundException(\`${n.pascalSingular} \${input.id} not found\`);
    }
    const deleted = await this.repo.softDelete(input.id, input.deletedBy);
    return ${n.pascalSingular}Mapper.toApiRow(deleted);
  }
}
`;

// =========================================================================
// Service specs
// =========================================================================
const specServiceSimple = (fileBase, ServiceClass, RepoClass) => `import { ${RepoClass} } from '../repositories/${RepoClass.replace(/Repository$/, '').replace(/([A-Z])/g, (m, p, i) => (i === 0 ? m.toLowerCase() : '-' + m.toLowerCase()))}.repository';
import { ${ServiceClass} } from './${fileBase}.service';

describe('${ServiceClass}', () => {
  let service: ${ServiceClass};

  beforeEach(() => {
    const repo = {} as unknown as ${RepoClass};
    service = new ${ServiceClass}(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
`;

// Spec de service: smoke com mock de repositório — expandir filtros/404 como em issue #81.
const specService = (n, fileBase, ServiceClass) => {
  const repo = `${n.pascalSingular}Repository`;
  const prismaModel = n.Model;
  if (fileBase === `create-${n.singularKebab}`) {
    return `import type { ${prismaModel} } from '@/generated/prisma/client';

import { build${n.pascalSingular}CreateInput } from '../mappers/${n.singularKebab}.prisma.mapper';
import { ${repo} } from '../repositories/${n.singularKebab}.repository';
import { Create${n.pascalSingular}DTO } from '../dtos/create-${n.singularKebab}.dto';

import { ${ServiceClass} } from './${fileBase}.service';

describe('${ServiceClass}', () => {
  let service: ${ServiceClass};
  let create: jest.Mock;

  beforeEach(() => {
    create = jest.fn();
    service = new ${ServiceClass}({ create } as unknown as ${repo});
  });

  it('delega repo.create ao output de build${n.pascalSingular}CreateInput', async () => {
    const dto = {} as Create${n.pascalSingular}DTO;
    const saved = { id: 'x' } as ${prismaModel};
    create.mockResolvedValue(saved);

    await service.execute(dto);

    expect(create).toHaveBeenCalledWith(build${n.pascalSingular}CreateInput(dto));
  });
});
`;
  }

  let repoMethods = '{}';
  if (fileBase === `update-${n.singularKebab}`) {
    repoMethods = '{ findById: jest.fn(), update: jest.fn() }';
  } else if (fileBase === `list-${n.pluralKebab}`) {
    repoMethods = '{ findMany: jest.fn(), count: jest.fn() }';
  } else if (fileBase === `find-${n.singularKebab}-by-id`) {
    repoMethods = '{ findById: jest.fn() }';
  } else if (fileBase === `remove-${n.singularKebab}`) {
    repoMethods = '{ findById: jest.fn(), softDelete: jest.fn() }';
  }

  return `import { ${repo} } from '../repositories/${n.singularKebab}.repository';

import { ${ServiceClass} } from './${fileBase}.service';

describe('${ServiceClass}', () => {
  let service: ${ServiceClass};

  beforeEach(() => {
    const repoStub = ${repoMethods} as unknown as ${repo};
    service = new ${ServiceClass}(repoStub);
  });

  it('instancia com repositório mock', () => {
    expect(service).toBeDefined();
  });
});
`;
};

// =========================================================================
// DTOs
// =========================================================================
const dtoCreate = (n) => `import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Body para POST /${n.pluralKebab}.
 *
 * TODO: adicionar campos conforme schema.prisma do model ${n.Model}.
 */
export class Create${n.pascalSingular}DTO {
  @ApiPropertyOptional({ description: 'TODO: descrever campo' })
  placeholder?: string;
}
`;

const dtoUpdate = (n) => `import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Body para PATCH /${n.pluralKebab}/:id.
 *
 * TODO: adicionar campos editáveis conforme schema.prisma do model ${n.Model}.
 */
export class Update${n.pascalSingular}DTO {
  @ApiPropertyOptional({ description: 'TODO: descrever campo' })
  placeholder?: string;
}
`;

const dtoListQuery = (n) => `import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';

/**
 * Query params para GET /${n.pluralKebab}.
 *
 * Extende BasePaginationQueryDTO (page/limit).
 * TODO: adicionar filtros específicos.
 */
export class List${n.pascalPlural}QueryDTO extends BasePaginationQueryDTO {}
`;

const dtoResponse = (n) => `import { ApiProperty } from '@nestjs/swagger';

/**
 * Resposta de item único do model ${n.Model}.
 *
 * TODO: espelhar campos do model conforme schema.prisma.
 */
export class ${n.pascalSingular}ResponseDTO {
  @ApiProperty({ description: 'Identificador único' })
  id!: string;
}
`;

const dtoPaginatedResponse = (n) => `import { ApiProperty } from '@nestjs/swagger';

import { BasePaginatedResponseDTO } from '@/common/dtos/base-paginated-response.dto';

import { ${n.pascalSingular}ResponseDTO } from './${n.singularKebab}-response.dto';

export class ${n.pascalPlural}PaginatedResponseDTO extends BasePaginatedResponseDTO<${n.pascalSingular}ResponseDTO> {
  @ApiProperty({ type: [${n.pascalSingular}ResponseDTO] })
  declare data: ${n.pascalSingular}ResponseDTO[];
}
`;

// =========================================================================
// Mapper
// =========================================================================
const mapper = (n) => `import type { ${n.Model} } from '@/generated/prisma/client';

import { ${n.pascalSingular}ResponseDTO } from '../dtos/${n.singularKebab}-response.dto';

export class ${n.pascalSingular}Mapper {
  static toApiRow(entity: ${n.Model}): ${n.pascalSingular}ResponseDTO {
    // TODO: implementar mapeamento completo
    return { id: entity.id } as ${n.pascalSingular}ResponseDTO;
  }

  static toApiRows(entities: ${n.Model}[]): ${n.pascalSingular}ResponseDTO[] {
    return entities.map((e) => ${n.pascalSingular}Mapper.toApiRow(e));
  }
}
`;

// =========================================================================
// Repository
// =========================================================================
const repoInterface = (n) => `import type { Prisma, ${n.Model} } from '@/generated/prisma/client';

export interface I${n.pascalSingular}Repository {
  create(data: Prisma.${n.Model}CreateInput): Promise<${n.Model}>;

  update(id: string, data: Prisma.${n.Model}UpdateInput): Promise<${n.Model}>;

  findById(id: string): Promise<${n.Model} | null>;

  findMany(
    where: Prisma.${n.Model}WhereInput,
    skip: number,
    take: number,
  ): Promise<${n.Model}[]>;

  count(where: Prisma.${n.Model}WhereInput): Promise<number>;

  /** Soft delete usando campos de auditoria deletedAt/deletedBy. */
  softDelete(id: string, deletedBy: string): Promise<${n.Model}>;
}
`;

const repoImpl = (n) => `import { Injectable } from '@nestjs/common';

import { Prisma, type ${n.Model} } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type { I${n.pascalSingular}Repository } from './${n.singularKebab}.repository.interface';

@Injectable()
export class ${n.pascalSingular}Repository implements I${n.pascalSingular}Repository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.${n.Model}CreateInput): Promise<${n.Model}> {
    // TODO: implementar
    return this.prisma.${n.camelSingular}.create({ data });
  }

  update(id: string, data: Prisma.${n.Model}UpdateInput): Promise<${n.Model}> {
    // TODO: implementar
    return this.prisma.${n.camelSingular}.update({ where: { id }, data });
  }

  findById(id: string): Promise<${n.Model} | null> {
    // TODO: implementar (considerar filtrar deletedAt = null)
    return this.prisma.${n.camelSingular}.findUnique({ where: { id } });
  }

  findMany(
    where: Prisma.${n.Model}WhereInput,
    skip: number,
    take: number,
  ): Promise<${n.Model}[]> {
    // TODO: implementar (considerar filtrar deletedAt = null e ordenar)
    return this.prisma.${n.camelSingular}.findMany({ where, skip, take });
  }

  count(where: Prisma.${n.Model}WhereInput): Promise<number> {
    // TODO: implementar
    return this.prisma.${n.camelSingular}.count({ where });
  }

  softDelete(id: string, deletedBy: string): Promise<${n.Model}> {
    // TODO: implementar (conferir se updatedBy também precisa ser atualizado)
    return this.prisma.${n.camelSingular}.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  }
}
`;

// =========================================================================
// Docs
// =========================================================================
const docsCreate = (n) => `import { applyDecorators } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';

import { ${n.pascalSingular}ResponseDTO } from '../dtos/${n.singularKebab}-response.dto';

export function Create${n.pascalSingular}Docs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({ summary: 'Cria um(a) ${n.pascalSingular}' }),
    ApiCreatedResponse({ type: ${n.pascalSingular}ResponseDTO }),
  );
}
`;

const docsUpdate = (n) => `import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiSecurity } from '@nestjs/swagger';

import { ${n.pascalSingular}ResponseDTO } from '../dtos/${n.singularKebab}-response.dto';

export function Update${n.pascalSingular}Docs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({ summary: 'Atualiza um(a) ${n.pascalSingular} por id' }),
    ApiParam({ name: 'id', description: 'Identificador' }),
    ApiOkResponse({ type: ${n.pascalSingular}ResponseDTO }),
  );
}
`;

const docsList = (n) => `import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiOperation, ApiQuery, ApiSecurity } from '@nestjs/swagger';

import { PaginationMetadataUtil } from '@/common/utils/pagination.util';

import { ${n.pascalPlural}PaginatedResponseDTO } from '../dtos/${n.pluralKebab}-paginated-response.dto';
import { ${n.pascalSingular}ResponseDTO } from '../dtos/${n.singularKebab}-response.dto';

export function List${n.pascalPlural}Docs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiExtraModels(
      PaginationMetadataUtil,
      ${n.pascalSingular}ResponseDTO,
      ${n.pascalPlural}PaginatedResponseDTO,
    ),
    ApiOperation({ summary: 'Lista paginada de ${n.apiTag}' }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 10 }),
    ApiOkResponse({ type: ${n.pascalPlural}PaginatedResponseDTO }),
  );
}
`;

const docsFindById = (n) => `import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiSecurity } from '@nestjs/swagger';

import { ${n.pascalSingular}ResponseDTO } from '../dtos/${n.singularKebab}-response.dto';

export function Find${n.pascalSingular}ByIdDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({ summary: 'Busca um(a) ${n.pascalSingular} por id' }),
    ApiParam({ name: 'id', description: 'Identificador' }),
    ApiOkResponse({ type: ${n.pascalSingular}ResponseDTO }),
  );
}
`;

const docsRemove = (n) => `import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiSecurity } from '@nestjs/swagger';

import { ${n.pascalSingular}ResponseDTO } from '../dtos/${n.singularKebab}-response.dto';

export function Remove${n.pascalSingular}Docs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({ summary: 'Remove (soft delete) um(a) ${n.pascalSingular} por id' }),
    ApiParam({ name: 'id', description: 'Identificador' }),
    ApiOkResponse({ type: ${n.pascalSingular}ResponseDTO }),
  );
}
`;

const docsIndex = (n) => `export { Create${n.pascalSingular}Docs } from './create-${n.singularKebab}.docs';
export { Find${n.pascalSingular}ByIdDocs } from './find-${n.singularKebab}-by-id.docs';
export { List${n.pascalPlural}Docs } from './list-${n.pluralKebab}.docs';
export { Remove${n.pascalSingular}Docs } from './remove-${n.singularKebab}.docs';
export { Update${n.pascalSingular}Docs } from './update-${n.singularKebab}.docs';
`;

// =========================================================================
// Module
// =========================================================================
const moduleFile = (n) => `import { Module } from '@nestjs/common';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';
import { PrismaModule } from '@/prisma/prisma.module';

import { Create${n.pascalSingular}Controller } from './controllers/create-${n.singularKebab}.controller';
import { Find${n.pascalSingular}ByIdController } from './controllers/find-${n.singularKebab}-by-id.controller';
import { List${n.pascalPlural}Controller } from './controllers/list-${n.pluralKebab}.controller';
import { Remove${n.pascalSingular}Controller } from './controllers/remove-${n.singularKebab}.controller';
import { Update${n.pascalSingular}Controller } from './controllers/update-${n.singularKebab}.controller';

import { ${n.pascalSingular}Repository } from './repositories/${n.singularKebab}.repository';

import { Create${n.pascalSingular}Service } from './services/create-${n.singularKebab}.service';
import { Find${n.pascalSingular}ByIdService } from './services/find-${n.singularKebab}-by-id.service';
import { List${n.pascalPlural}Service } from './services/list-${n.pluralKebab}.service';
import { Remove${n.pascalSingular}Service } from './services/remove-${n.singularKebab}.service';
import { Update${n.pascalSingular}Service } from './services/update-${n.singularKebab}.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    Create${n.pascalSingular}Controller,
    Update${n.pascalSingular}Controller,
    List${n.pascalPlural}Controller,
    Find${n.pascalSingular}ByIdController,
    Remove${n.pascalSingular}Controller,
  ],
  providers: [
    AerobiApiKeyGuard,
    ${n.pascalSingular}Repository,
    Create${n.pascalSingular}Service,
    Update${n.pascalSingular}Service,
    List${n.pascalPlural}Service,
    Find${n.pascalSingular}ByIdService,
    Remove${n.pascalSingular}Service,
  ],
})
export class ${n.pascalPlural}Module {}
`;

// =========================================================================
// READMEs
// =========================================================================
const readmeControllers = (n) => `# controllers

Camada HTTP do módulo \`${n.pluralKebab}\`. Um arquivo por operação.

## Arquivos

- \`create-${n.singularKebab}.controller.ts\` — \`POST /${n.pluralKebab}\`
- \`update-${n.singularKebab}.controller.ts\` — \`PATCH /${n.pluralKebab}/:id\`
- \`list-${n.pluralKebab}.controller.ts\` — \`GET /${n.pluralKebab}\` (paginado)
- \`find-${n.singularKebab}-by-id.controller.ts\` — \`GET /${n.pluralKebab}/:id\`
- \`remove-${n.singularKebab}.controller.ts\` — \`DELETE /${n.pluralKebab}/:id\` (soft delete)

Cada controller tem um \`*.spec.ts\` irmão.

## Regras

- Magros: recebem a request, delegam ao service em \`../services\` e retornam.
- Swagger via decoradores importados de \`../docs\` (\`@Create${n.pascalSingular}Docs()\` etc.).
- Guard padrão: \`@UseGuards(AerobiApiKeyGuard)\` na classe.
- Sem lógica de negócio — se você precisa transformar dados, faça no service ou mapper.
`;

const readmeDocs = (n) => `# docs

Decoradores Swagger agrupados. Um arquivo \`*.docs.ts\` por controller.

## Arquivos

- \`create-${n.singularKebab}.docs.ts\`
- \`update-${n.singularKebab}.docs.ts\`
- \`list-${n.pluralKebab}.docs.ts\`
- \`find-${n.singularKebab}-by-id.docs.ts\`
- \`remove-${n.singularKebab}.docs.ts\`
- \`index.ts\` — barril que reexporta todos.

## Padrão

Cada arquivo exporta uma função nomeada (\`{Operacao}Docs()\`) que retorna \`applyDecorators(...)\`
com \`@ApiOperation\`, \`@ApiSecurity\`, \`@ApiParam/@ApiQuery\`, \`@ApiOkResponse\` etc.

Mantém o controller limpo e os decoradores reaproveitáveis.
`;

const readmeDtos = (n) => `# dtos

DTOs de entrada e saída, validados com \`class-validator\` e documentados com \`@ApiProperty\`.

## Arquivos

- \`create-${n.singularKebab}.dto.ts\` — body de \`POST\` (também usado como input do service).
- \`update-${n.singularKebab}.dto.ts\` — body de \`PATCH\`.
- \`list-${n.pluralKebab}-query.dto.ts\` — query de \`GET\`; extende \`BasePaginationQueryDTO\`.
- \`${n.singularKebab}-response.dto.ts\` — resposta de item único.
- \`${n.pluralKebab}-paginated-response.dto.ts\` — resposta de listagem; extende \`BasePaginatedResponseDTO\`.

## Padrão

- Listagens **sempre** usam \`BasePaginatedResponseDTO<T>\` (\`@/common/dtos/base-paginated-response.dto\`).
- DTOs de entrada do controller podem ser reutilizados como entrada do service quando a forma bate. Quando o service precisa de campos extras (ex.: \`id\` no update, \`deletedBy\` no remove), exporte um tipo no próprio service.
`;

const readmeMappers = (n) => `# mappers

Transformações puras: entidade Prisma → DTO HTTP, e DTO de entrada → \`Prisma.*CreateInput\` / \`UpdateInput\`.

## Arquivos

- \`${n.singularKebab}.mapper.ts\` — \`${n.pascalSingular}Mapper\`: \`toApiRow\`, \`toApiRows\`.
- \`${n.singularKebab}.prisma.mapper.ts\` — funções nomeadas (\`build${n.pascalSingular}CreateInput\`, \`patch${n.pascalSingular}ToPrisma\`) chamadas pelos services de create/update; testáveis com Jest em isolamento.

## Regras

- Sem I/O nem \`@Injectable()\`.
- Services chamam o mapper HTTP antes de retornar; create/update também usam o prisma mapper antes do repository.
`;

const readmeRepositories = (n) => `# repositories

Única camada de acesso ao banco (Prisma). Não instanciar \`PrismaService\` em service ou controller.

## Arquivos

- \`${n.singularKebab}.repository.interface.ts\` — assinatura \`I${n.pascalSingular}Repository\`.
- \`${n.singularKebab}.repository.ts\` — implementação \`${n.pascalSingular}Repository implements I${n.pascalSingular}Repository\`.

## Convenções

- Métodos básicos: \`create\`, \`update\`, \`findById\`, \`findMany\`, \`count\`, \`softDelete\`.
- \`softDelete\` usa \`deletedAt\` + \`deletedBy\` (campos de auditoria do model).
- Registrar o repository como provider no \`${n.pluralKebab}.module.ts\`.
- Se precisar de SQL cru, crie um \`*.sql.ts\` irmão (ver padrão em \`src/modules/rab\`).
`;

const readmeServices = (n) => `# services

Lógica de negócio. Um arquivo por operação.

## Arquivos

- \`create-${n.singularKebab}.service.ts\`
- \`update-${n.singularKebab}.service.ts\`
- \`list-${n.pluralKebab}.service.ts\` — usa \`resolvePaginationParams\` + \`${n.pascalPlural}PaginatedResponseDTO\`.
- \`find-${n.singularKebab}-by-id.service.ts\`
- \`remove-${n.singularKebab}.service.ts\` — soft delete.

Cada service tem um \`*.spec.ts\` irmão.

## Padrão

- Classe \`@Injectable()\` com método único \`.execute(input): Promise<output>\`.
- Dependências (repository, outros services) injetadas como \`private readonly\` no construtor.
- Services orquestram: repository + mapper + validações + regras de negócio.
- Nunca tocam no \`PrismaService\` diretamente — sempre via repository.
`;

const readmeUtils = (n) => `# utils

Funções puras e helpers reutilizáveis **dentro deste módulo**.

Exemplos típicos:
- construtores de \`where\` a partir da query (ex.: \`build-${n.singularKebab}-where.util.ts\`);
- normalizadores de strings, datas, enums;
- constantes do domínio.

## Regras

- Sem dependências Nest (\`@Injectable\`, \`@Inject\`). Se precisar, suba para \`services/\`.
- Pura quando possível. Testes \`*.spec.ts\` ao lado.
- Se a utilidade for útil a outros módulos, mova para \`src/common/utils/\`.
`;

// =========================================================================
// Geração
// =========================================================================
console.log(`[scaffold] gerando ${names.pluralKebab} (model ${names.Model})`);

// Module root
writeFile(`${names.pluralKebab}.module.ts`, moduleFile(names));

// Controllers
writeFile('controllers/README.md', readmeControllers(names));
writeFile(`controllers/create-${names.singularKebab}.controller.ts`, controllerCreate(names));
writeFile(
  `controllers/create-${names.singularKebab}.controller.spec.ts`,
  specControllerWithOp(
    names,
    `create-${names.singularKebab}`,
    `Create${names.pascalSingular}Service`,
    `Create${names.pascalSingular}Controller`,
  ),
);
writeFile(`controllers/update-${names.singularKebab}.controller.ts`, controllerUpdate(names));
writeFile(
  `controllers/update-${names.singularKebab}.controller.spec.ts`,
  specControllerWithOp(
    names,
    `update-${names.singularKebab}`,
    `Update${names.pascalSingular}Service`,
    `Update${names.pascalSingular}Controller`,
  ),
);
writeFile(`controllers/list-${names.pluralKebab}.controller.ts`, controllerList(names));
writeFile(
  `controllers/list-${names.pluralKebab}.controller.spec.ts`,
  specControllerWithOp(
    names,
    `list-${names.pluralKebab}`,
    `List${names.pascalPlural}Service`,
    `List${names.pascalPlural}Controller`,
  ),
);
writeFile(
  `controllers/find-${names.singularKebab}-by-id.controller.ts`,
  controllerFindById(names),
);
writeFile(
  `controllers/find-${names.singularKebab}-by-id.controller.spec.ts`,
  specControllerWithOp(
    names,
    `find-${names.singularKebab}-by-id`,
    `Find${names.pascalSingular}ByIdService`,
    `Find${names.pascalSingular}ByIdController`,
  ),
);
writeFile(`controllers/remove-${names.singularKebab}.controller.ts`, controllerRemove(names));
writeFile(
  `controllers/remove-${names.singularKebab}.controller.spec.ts`,
  specControllerWithOp(
    names,
    `remove-${names.singularKebab}`,
    `Remove${names.pascalSingular}Service`,
    `Remove${names.pascalSingular}Controller`,
  ),
);

// Docs
writeFile('docs/README.md', readmeDocs(names));
writeFile('docs/index.ts', docsIndex(names));
writeFile(`docs/create-${names.singularKebab}.docs.ts`, docsCreate(names));
writeFile(`docs/update-${names.singularKebab}.docs.ts`, docsUpdate(names));
writeFile(`docs/list-${names.pluralKebab}.docs.ts`, docsList(names));
writeFile(`docs/find-${names.singularKebab}-by-id.docs.ts`, docsFindById(names));
writeFile(`docs/remove-${names.singularKebab}.docs.ts`, docsRemove(names));

// DTOs
writeFile('dtos/README.md', readmeDtos(names));
writeFile(`dtos/create-${names.singularKebab}.dto.ts`, dtoCreate(names));
writeFile(`dtos/update-${names.singularKebab}.dto.ts`, dtoUpdate(names));
writeFile(`dtos/list-${names.pluralKebab}-query.dto.ts`, dtoListQuery(names));
writeFile(`dtos/${names.singularKebab}-response.dto.ts`, dtoResponse(names));
writeFile(`dtos/${names.pluralKebab}-paginated-response.dto.ts`, dtoPaginatedResponse(names));

// Mappers
writeFile('mappers/README.md', readmeMappers(names));
writeFile(`mappers/${names.singularKebab}.mapper.ts`, mapper(names));
writeFile(
  `mappers/${names.singularKebab}.prisma.mapper.ts`,
  prismaMapperModule(names),
);

// Repositories
writeFile('repositories/README.md', readmeRepositories(names));
writeFile(`repositories/${names.singularKebab}.repository.interface.ts`, repoInterface(names));
writeFile(`repositories/${names.singularKebab}.repository.ts`, repoImpl(names));

// Services
writeFile('services/README.md', readmeServices(names));
writeFile(`services/create-${names.singularKebab}.service.ts`, serviceCreate(names));
writeFile(
  `services/create-${names.singularKebab}.service.spec.ts`,
  specService(names, `create-${names.singularKebab}`, `Create${names.pascalSingular}Service`),
);
writeFile(`services/update-${names.singularKebab}.service.ts`, serviceUpdate(names));
writeFile(
  `services/update-${names.singularKebab}.service.spec.ts`,
  specService(names, `update-${names.singularKebab}`, `Update${names.pascalSingular}Service`),
);
writeFile(`services/list-${names.pluralKebab}.service.ts`, serviceList(names));
writeFile(
  `services/list-${names.pluralKebab}.service.spec.ts`,
  specService(names, `list-${names.pluralKebab}`, `List${names.pascalPlural}Service`),
);
writeFile(`services/find-${names.singularKebab}-by-id.service.ts`, serviceFindById(names));
writeFile(
  `services/find-${names.singularKebab}-by-id.service.spec.ts`,
  specService(
    names,
    `find-${names.singularKebab}-by-id`,
    `Find${names.pascalSingular}ByIdService`,
  ),
);
writeFile(`services/remove-${names.singularKebab}.service.ts`, serviceRemove(names));
writeFile(
  `services/remove-${names.singularKebab}.service.spec.ts`,
  specService(names, `remove-${names.singularKebab}`, `Remove${names.pascalSingular}Service`),
);

// Utils
writeFile('utils/README.md', readmeUtils(names));

console.log(`[scaffold] ok — ${names.pluralKebab} gerado em src/modules/${names.pluralKebab}`);
