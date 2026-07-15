import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';

import { RabRowResponseDTO } from './rab-row-response.dto';

/**
 * Controller isolado só para materializar o `RabRowResponseDTO` em
 * `components.schemas` ao gerar o documento OpenAPI (sem guards nem DB).
 */
@Controller('__rab_row_probe')
class RabRowProbeController {
  @Get()
  @ApiOkResponse({ type: RabRowResponseDTO })
  handle(): RabRowResponseDTO {
    return {} as RabRowResponseDTO;
  }
}

type SchemaProps = Record<string, Record<string, unknown>>;

async function buildRabRowSchemaProps(): Promise<SchemaProps> {
  const moduleRef = await Test.createTestingModule({
    controllers: [RabRowProbeController],
  }).compile();
  const app = moduleRef.createNestApplication();
  await app.init();
  try {
    const doc = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().build(),
    );
    const schema = doc.components?.schemas?.['RabRowResponseDTO'] as
      | { properties?: SchemaProps }
      | undefined;
    return schema?.properties ?? {};
  } finally {
    await app.close();
  }
}

describe('RabRowResponseDTO — schema OpenAPI', () => {
  let props: SchemaProps;

  beforeAll(async () => {
    props = await buildRabRowSchemaProps();
  });

  it('materializa o schema com os campos do RAB', () => {
    expect(Object.keys(props)).toEqual(
      expect.arrayContaining(['id', 'period', 'marcas', 'proprietarios']),
    );
  });

  it('id/period/marcas são string obrigatória', () => {
    expect(props.id).toMatchObject({ type: 'string' });
    expect(props.period).toMatchObject({ type: 'string' });
    expect(props.marcas).toMatchObject({ type: 'string' });
  });

  it('campos opcionais são `string` nullable (não objeto vazio {})', () => {
    expect(props.proprietarios).toEqual({ type: 'string', nullable: true });
    expect(props.operadores).toEqual({ type: 'string', nullable: true });
    expect(props.tpOperacao).toEqual({ type: 'string', nullable: true });
  });

  it('regressão: nenhum campo é um schema vazio {} (bug do `string | null` sem type)', () => {
    for (const value of Object.values(props)) {
      expect(value).not.toEqual({});
      expect(value.type).toBe('string');
    }
  });
});
