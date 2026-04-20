import { parseDate } from './date-parser.util';

export function calculateValidity(validade: string | null): {
  valida: boolean;
  emTolerancia: boolean;
  diasParaVencimento: number | null;
} {
  if (!validade) {
    return { valida: false, emTolerancia: false, diasParaVencimento: null };
  }

  const validadeDate = parseDate(validade);
  if (!validadeDate) {
    return { valida: false, emTolerancia: false, diasParaVencimento: null };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const validadeDateNormalized = new Date(validadeDate);
  validadeDateNormalized.setHours(0, 0, 0, 0);

  const diffTime = validadeDateNormalized.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // RBAC 61.33(b): tolerância de 30 dias após vencimento
  if (diffDays >= 0) {
    // Ainda não venceu
    return { valida: true, emTolerancia: false, diasParaVencimento: diffDays };
  } else if (diffDays >= -30) {
    // Venceu há menos de 30 dias - período de tolerância
    return { valida: true, emTolerancia: true, diasParaVencimento: diffDays };
  } else {
    // Venceu há 30 dias ou mais
    return { valida: false, emTolerancia: false, diasParaVencimento: diffDays };
  }
}
