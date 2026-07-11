/**
 * Dados de demonstração de aeródromos — **1 aeródromo real por UF** (27 no
 * total), usado pelo seed `aerodromes`. A fonte é a base pública da ANAC já
 * sincronizada na API (`public_aerodrome`): para cada UF foi escolhido o
 * primeiro aeródromo (ordem de ICAO) com código OACI e coordenadas válidas.
 *
 * Coordenadas em DMS (formato `GG°MM'SS"H`), compatíveis com o validador
 * `IsDmsCoordinate` do módulo de aeródromos. `altitude` em metros, no formato da
 * ANAC (vírgula decimal). Nada aqui muda no tempo — é um catálogo estável e
 * determinístico (sem rede em tempo de seed).
 */
import { Uf } from '@/generated/prisma/enums';

/** Aeródromo-âncora de demonstração (domínio; o grupo é resolvido por UF). */
export interface DevAerodrome {
  uf: Uf;
  icao: string;
  name: string;
  municipality: string;
  /** Latitude em DMS (`GG°MM'SS"S|N`). */
  latitude: string;
  /** Longitude em DMS (`GGG°MM'SS"W|E`). */
  longitude: string;
  /** Altitude em metros (formato ANAC, vírgula decimal). */
  altitude: string;
}

/**
 * Um aeródromo por UF (27), em ordem estável de sigla. Ids não são fixados aqui
 * — o seed é create-only pela chave `(groupId, icao)` entre ativos.
 */
export const DEV_AERODROMES: readonly DevAerodrome[] = [
  {
    uf: Uf.AC,
    icao: 'SBCZ',
    name: 'Cruzeiro do Sul',
    municipality: 'CRUZEIRO DO SUL',
    latitude: `07°35'58"S`,
    longitude: `072°46'10"W`,
    altitude: '194,0',
  },
  {
    uf: Uf.AL,
    icao: 'SBMO',
    name: 'Zumbi dos Palmares',
    municipality: 'MACEIÓ',
    latitude: `09°30'39"S`,
    longitude: `035°47'30"W`,
    altitude: '118,0',
  },
  {
    uf: Uf.AM,
    icao: 'SBEG',
    name: 'Eduardo Gomes',
    municipality: 'MANAUS',
    latitude: `03°02'28"S`,
    longitude: `060°03'02"W`,
    altitude: '80,0',
  },
  {
    uf: Uf.AP,
    icao: 'SBMQ',
    name: 'Alberto Alcolumbre',
    municipality: 'MACAPÁ',
    latitude: `00°03'02"N`,
    longitude: `051°04'20"W`,
    altitude: '17,0',
  },
  {
    uf: Uf.BA,
    icao: 'SBIL',
    name: 'Bahia - Jorge Amado',
    municipality: 'ILHÉUS',
    latitude: `14°48'54"S`,
    longitude: `039°02'00"W`,
    altitude: '4,0',
  },
  {
    uf: Uf.CE,
    icao: 'SBAC',
    name: 'Aeroporto Regional de Canoa Quebrada Dragão do Mar',
    municipality: 'ARACATI',
    latitude: `04°34'07"S`,
    longitude: `037°48'17"W`,
    altitude: '36,0',
  },
  {
    uf: Uf.DF,
    icao: 'SBBR',
    name: 'Presidente Juscelino Kubitschek',
    municipality: 'BRASÍLIA',
    latitude: `15°52'16"S`,
    longitude: `047°55'07"W`,
    altitude: '1066,0',
  },
  {
    uf: Uf.ES,
    icao: 'SBVT',
    name: 'Eurico de Aguiar Salles',
    municipality: 'VITÓRIA',
    latitude: `20°15'29"S`,
    longitude: `040°17'11"W`,
    altitude: '3,0',
  },
  {
    uf: Uf.GO,
    icao: 'SBCN',
    name: 'Nelson Rodrigues Guimarães',
    municipality: 'CALDAS NOVAS',
    latitude: `17°43'30"S`,
    longitude: `048°36'23"W`,
    altitude: '703,0',
  },
  {
    uf: Uf.MA,
    icao: 'SBCI',
    name: 'Brigadeiro Lysias Augusto Rodrigues',
    municipality: 'CAROLINA',
    latitude: `07°19'14"S`,
    longitude: `047°27'31"W`,
    altitude: '172,0',
  },
  {
    uf: Uf.MG,
    icao: 'SBAX',
    name: 'Romeu Zema',
    municipality: 'ARAXÁ',
    latitude: `19°33'47"S`,
    longitude: `046°57'38"W`,
    altitude: '998,0',
  },
  {
    uf: Uf.MS,
    icao: 'SBCG',
    name: 'Aeroporto Internacional de Campo Grande - Ueze Elias Zahran',
    municipality: 'CAMPO GRANDE',
    latitude: `20°28'10"S`,
    longitude: `054°40'13"W`,
    altitude: '559,0',
  },
  {
    uf: Uf.MT,
    icao: 'SBAT',
    name: 'PILOTO OSVALDO MARQUES DIAS',
    municipality: 'ALTA FLORESTA',
    latitude: `09°51'59"S`,
    longitude: `056°06'18"W`,
    altitude: '289,0',
  },
  {
    uf: Uf.PA,
    icao: 'SBAA',
    name: 'Conceição do Araguaia',
    municipality: 'CONCEIÇÃO DO ARAGUAIA',
    latitude: `08°20'55"S`,
    longitude: `049°18'11"W`,
    altitude: '199,0',
  },
  {
    uf: Uf.PB,
    icao: 'SBJP',
    name: 'Presidente Castro Pinto',
    municipality: 'BAYEUX',
    latitude: `07°08'54"S`,
    longitude: `034°57'01"W`,
    altitude: '66,0',
  },
  {
    uf: Uf.PE,
    icao: 'SBFN',
    name: 'Fernando de Noronha',
    municipality: 'FERNANDO DE NORONHA',
    latitude: `03°51'17"S`,
    longitude: `032°25'42"W`,
    altitude: '58,0',
  },
  {
    uf: Uf.PI,
    icao: 'SBPB',
    name: 'Prefeito Doutor João Silva Filho',
    municipality: 'PARNAÍBA',
    latitude: `02°53'36"S`,
    longitude: `041°43'49"W`,
    altitude: '7,0',
  },
  {
    uf: Uf.PR,
    icao: 'SBBI',
    name: 'Bacacheri',
    municipality: 'CURITIBA',
    latitude: `25°24'12"S`,
    longitude: `049°14'01"W`,
    altitude: '931,0',
  },
  {
    uf: Uf.RJ,
    icao: 'SBCB',
    name: 'Cabo Frio',
    municipality: 'CABO FRIO',
    latitude: `22°55'15"S`,
    longitude: `042°04'17"W`,
    altitude: '7,0',
  },
  {
    uf: Uf.RN,
    icao: 'SBMS',
    name: 'Dix-Sept Rosado',
    municipality: 'MOSSORÓ',
    latitude: `05°11'45"S`,
    longitude: `037°21'42"W`,
    altitude: '23,0',
  },
  {
    uf: Uf.RO,
    icao: 'SBGM',
    name: 'Guajará-Mirim',
    municipality: 'GUAJARÁ-MIRIM',
    latitude: `10°47'18"S`,
    longitude: `065°16'54"W`,
    altitude: '146,0',
  },
  {
    uf: Uf.RR,
    icao: 'SBBV',
    name: 'Atlas Brasil Cantanhede',
    municipality: 'BOA VISTA',
    latitude: `02°50'29"N`,
    longitude: `060°41'32"W`,
    altitude: '84,0',
  },
  {
    uf: Uf.RS,
    icao: 'SBBG',
    name: 'Comandante Gustavo Kraemer',
    municipality: 'BAGÉ',
    latitude: `31°23'27"S`,
    longitude: `054°06'35"W`,
    altitude: '182,0',
  },
  {
    uf: Uf.SC,
    icao: 'SBCD',
    name: 'Prefeito Dr. Carlos Alberto da Costa Neves',
    municipality: 'CAÇADOR',
    latitude: `26°47'17"S`,
    longitude: `050°56'24"W`,
    altitude: '1029,0',
  },
  {
    uf: Uf.SE,
    icao: 'SBAR',
    name: 'Santa Maria',
    municipality: 'ARACAJU',
    latitude: `10°59'07"S`,
    longitude: `037°04'24"W`,
    altitude: '7,0',
  },
  {
    uf: Uf.SP,
    icao: 'SBAE',
    name: 'Bauru/Arealva',
    municipality: 'BAURU',
    latitude: `22°09'28"S`,
    longitude: `049°04'06"W`,
    altitude: '598,0',
  },
  {
    uf: Uf.TO,
    icao: 'SBPJ',
    name: 'Brigadeiro Lysias Rodrigues',
    municipality: 'PALMAS',
    latitude: `10°17'24"S`,
    longitude: `048°21'28"W`,
    altitude: '236,0',
  },
] as const;
