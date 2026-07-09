import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import {
  AdminDashboardDTO,
  OperatorDashboardDTO,
  TechnicalDashboardDTO,
} from '../dtos/dashboard-response.dto';

/**
 * Documentação de `GET /dashboard`. A resposta é **discriminada por `meta.role`**
 * (`oneOf`): admin/coordinator recebem todos os blocos (inclui `tasks`), operator
 * omite `tasks`, technical recebe só `technicalVisits` + `aerodromes`. Segurança
 * `ApiBearerAuth` casa o `JwtAuthGuard` real da rota.
 */
export function GetDashboardDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiExtraModels(
      AdminDashboardDTO,
      OperatorDashboardDTO,
      TechnicalDashboardDTO,
    ),
    ApiOperation({
      summary: 'Dashboard agregado por papel',
      description:
        'Consolida os módulos migrados (solicitações de pouso, visitas técnicas, ' +
        'aeródromos, avaliações e — para admin/coordinator — tarefas do plano), ' +
        'recortado por papel e por escopo de grupo (admin global; ' +
        'coordinator/operator/technical restritos ao próprio grupo; sem grupo → ' +
        'agregados vazios). Faixa de tempo por preset `7d/30d/90d/12m/custom` ' +
        '(default `30d`). Requer `dashboard:read`.',
    }),
    ApiOkResponse({
      description: 'Dashboard do papel do ator (discriminado por `meta.role`).',
      schema: {
        oneOf: [
          { $ref: getSchemaPath(AdminDashboardDTO) },
          { $ref: getSchemaPath(OperatorDashboardDTO) },
          { $ref: getSchemaPath(TechnicalDashboardDTO) },
        ],
      },
    }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `dashboard:read`.' }),
  );
}
