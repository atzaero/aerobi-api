import { applyDecorators } from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBadGatewayResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiSecurity,
} from '@nestjs/swagger';

import { CreateContactResponseDTO } from '../dtos/create-contact-response.dto';

export function CreateContactDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Envia mensagem pública do formulário Fale conosco',
      description:
        'Rota pública (`X-API-Key`). Anti-abuso com supressão silenciosa (202). ' +
        'Sucesso real retorna 201 com `{ id }` após envio do comprovante por e-mail.',
    }),
    ApiCreatedResponse({ type: CreateContactResponseDTO }),
    ApiAcceptedResponse({ description: 'Supressão anti-abuso (sem corpo)' }),
    ApiBadGatewayResponse({
      description: 'Falha ao enviar comprovante por e-mail',
    }),
  );
}
