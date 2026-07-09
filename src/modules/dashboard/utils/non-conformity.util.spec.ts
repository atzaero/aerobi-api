import {
  countNonConformities,
  TECHNICAL_VISIT_NON_CONFORMITIES,
  type TechnicalVisitInspectionRow,
} from './non-conformity.util';

/** Visita 100% conforme: presenças boas `true`, problemas `false`. */
const conformingVisit: TechnicalVisitInspectionRow = {
  hasGatesPadlocks: true,
  hasFence: true,
  hasStandardPlate: true,
  hasQualityHoles: false,
  hasHorizontalSignage: true,
  hasUnobstructedHeadboards: true,
  pavementRegularity: true,
  hasTrashDebris: false,
  hasDelimitedPerimeter: true,
  hasInvasion: false,
};

describe('countNonConformities', () => {
  it('visita conforme → nenhuma não-conformidade (objeto vazio)', () => {
    expect(countNonConformities([conformingVisit])).toEqual({});
  });

  it('null em presença-boa conta como não-conformidade (paridade asBoolean)', () => {
    const visit: TechnicalVisitInspectionRow = {
      ...conformingVisit,
      hasFence: null,
    };
    expect(countNonConformities([visit])).toEqual({ sem_cerca: 1 });
  });

  it('null em item-problema NÃO conta', () => {
    const visit: TechnicalVisitInspectionRow = {
      ...conformingVisit,
      hasInvasion: null,
    };
    expect(countNonConformities([visit])).toEqual({});
  });

  it('problema presente conta com a chave direta', () => {
    const visit: TechnicalVisitInspectionRow = {
      ...conformingVisit,
      hasQualityHoles: true,
      hasTrashDebris: true,
      hasInvasion: true,
    };
    expect(countNonConformities([visit])).toEqual({
      buracos: 1,
      lixo_detritos: 1,
      invasao: 1,
    });
  });

  it('agrega contagens entre visitas e omite chaves zeradas', () => {
    const missingGates: TechnicalVisitInspectionRow = {
      ...conformingVisit,
      hasGatesPadlocks: false,
    };
    expect(countNonConformities([missingGates, missingGates])).toEqual({
      sem_portoes_cadeados: 2,
    });
  });

  it('expõe exatamente as 10 não-conformidades curadas', () => {
    expect(TECHNICAL_VISIT_NON_CONFORMITIES).toHaveLength(10);
    expect(TECHNICAL_VISIT_NON_CONFORMITIES.map((n) => n.key)).toEqual([
      'sem_portoes_cadeados',
      'sem_cerca',
      'sem_placa_padrao',
      'buracos',
      'sem_sinalizacao_horizontal',
      'cabeceiras_obstruidas',
      'pavimento_irregular',
      'lixo_detritos',
      'perimetro_nao_delimitado',
      'invasao',
    ]);
  });
});
