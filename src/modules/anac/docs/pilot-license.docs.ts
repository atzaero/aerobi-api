import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';

import { PilotLicenseResponseDto } from '../dtos/pilot-license-response.dto';

export function PilotLicenseDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Consultar licença de piloto ANAC',
      description:
        'Consulta os dados de licença, habilitações e certificado médico de um piloto no site da ANAC.',
    }),
    ApiSecurity('api_key'),
    ApiQuery({
      name: 'cpf',
      required: true,
      type: String,
      description: 'CPF do piloto (com ou sem formatação)',
      example: '856.859.259-72',
    }),
    ApiQuery({
      name: 'canac',
      required: true,
      type: String,
      description: 'Código ANAC do piloto',
      example: '204603',
    }),
    ApiResponse({
      status: 200,
      description: 'Dados da licença encontrados com sucesso',
      type: PilotLicenseResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Parâmetros inválidos (CPF e CANAC são obrigatórios)',
    }),
    ApiResponse({
      status: 401,
      description: 'Missing or invalid X-API-Key',
    }),
    ApiResponse({
      status: 429,
      description: 'Muitas requisições. Tente novamente em alguns minutos.',
    }),
    ApiResponse({
      status: 500,
      description: 'Erro ao consultar licença no site da ANAC',
    }),
  );
}
