import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { PaginationMetadataUtil } from '@/common/utils/pagination.util';

import { LandingRequestsPaginatedResponseDTO } from '../dtos/landing-requests-paginated-response.dto';
import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';

export function ListLandingRequestsDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiExtraModels(
      PaginationMetadataUtil,
      LandingRequestResponseDTO,
      LandingRequestsPaginatedResponseDTO,
    ),
    ApiOperation({
      summary: 'Lista solicitações de pouso (moderação)',
      description:
        'Requer `landing_request:list`. Escopo por grupo: ADMIN vê todas; ' +
        'COORDINATOR/OPERATOR só as de aeródromos do próprio grupo. Filtros por ' +
        'status/aeródromo (igualdade), ICAO/modelo/matrícula/pilotCode/e-mail ' +
        '(substring) e intervalos de data; ordenação pendentes-FIFO; CPF ' +
        'mascarado.',
    }),
    ApiOkResponse({ type: LandingRequestsPaginatedResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({
      description: 'Sem permissão `landing_request:list`.',
    }),
  );
}
