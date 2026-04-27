import { ApiProperty } from '@nestjs/swagger';
import { HabilitacaoDto } from './habilitacao.dto';
import { LicenseDto } from './license.dto';
import { CertificadoMedicoDto } from './certificado-medico.dto';

export class PilotLicenseDadosDto {
  @ApiProperty({ example: 'João da Silva', required: false })
  nome?: string;

  @ApiProperty({ example: '15/06/1980', required: false })
  data_nascimento?: string;

  @ApiProperty({ example: '204603', required: false })
  canac?: string;

  @ApiProperty({ type: [LicenseDto], required: false })
  licencas?: LicenseDto[];

  @ApiProperty({ type: [HabilitacaoDto], required: false })
  habilitacoes?: HabilitacaoDto[];

  @ApiProperty({ type: [CertificadoMedicoDto], required: false })
  certificado_medico?: CertificadoMedicoDto[];

  @ApiProperty({ required: false })
  raw_data?: Record<string, any>;
}

export class PilotLicenseResponseDto {
  @ApiProperty({ example: true })
  valido!: boolean;

  @ApiProperty({ example: true })
  possui_carteira!: boolean;

  @ApiProperty({ example: '15/06/2025', required: false })
  validade?: string;

  @ApiProperty({ example: false })
  em_periodo_tolerancia!: boolean;

  @ApiProperty({ example: 120, required: false })
  dias_para_vencimento?: number | null;

  @ApiProperty({ type: PilotLicenseDadosDto })
  dados!: PilotLicenseDadosDto;
}
