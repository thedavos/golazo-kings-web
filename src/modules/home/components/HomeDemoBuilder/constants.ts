import { formatEuro, formatDollar } from 'src/modules/shared/utils/formatCurrency.util';
import type { LeagueOptionList, LeagueOption, CurrencyOptionList, CurrencyOption } from './types';

export const LEAGUE_OPTION_DEFAULT: LeagueOption = {
  label: 'Kings League',
  value: 'kings',
  description: 'Liga masculina',
  icon: 'fa fa-chess-king',
  color: 'text-yellow-400',
  type: 'kings',
};

export const LEAGUE_OPTIONS: LeagueOptionList = [
  {
    ...LEAGUE_OPTION_DEFAULT,
  },
  {
    label: 'Kings League España',
    value: 'kings_esp',
    description: 'Liga masculina',
    icon: 'fa fa-chess-king',
    color: 'text-yellow-400',
    type: 'kings',
  },
  {
    label: 'Kings League Américas',
    value: 'kings_am',
    description: 'Liga masculina',
    icon: 'fa fa-chess-king',
    color: 'text-yellow-400',
    type: 'kings',
  },
  {
    label: 'Queens League',
    value: 'queens',
    description: 'Liga femenina',
    icon: 'fa fa-chess-queen',
    color: 'text-blue-400',
    type: 'queens',
  },
  {
    label: 'Queens League España',
    value: 'queens_esp',
    description: 'Liga femenina',
    icon: 'fa fa-chess-queen',
    color: 'text-blue-400',
    type: 'queens',
  },
  {
    label: 'Queens League Américas',
    value: 'queens_am',
    description: 'Liga femenina',
    icon: 'fa fa-chess-queen',
    color: 'text-blue-400',
    type: 'queens',
  },
];

export const CURRENCY_OPTION_DEFAULT: CurrencyOption = {
  label: 'Dólares',
  value: 'USD',
  code: 'USD',
  symbol: '$',
  formatter: formatDollar,
  mask: '#,###,###,###',
};

export const CURRENCY_OPTIONS: CurrencyOptionList = [
  {
    ...CURRENCY_OPTION_DEFAULT,
  },
  {
    label: 'Euros',
    value: 'EUR',
    code: 'EUR',
    symbol: '€',
    formatter: formatEuro,
    mask: '#.###.###.###',
  },
];
