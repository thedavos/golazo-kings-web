import type { CurrencyOption, CurrencyOptionList } from 'src/modules/lineup-builder/types';
import {
  formatDollar,
  formatEuro,
  formatReal,
  formatPesoMexicano,
  formatSol,
  formatRialSaudi,
} from 'src/modules/shared/utils/formatCurrency.util';

export const DEFAULT_OPTION: CurrencyOption = {
  label: 'Dólares',
  value: 'USD',
  code: 'USD',
  symbol: '$',
  hint: 'Valor en dólares',
  mask: '#,###,###,###',
  formatter: formatDollar,
};

export const LIST_OPTIONS: CurrencyOptionList = [
  {
    ...DEFAULT_OPTION,
  },
  {
    label: 'Euros',
    value: 'EUR',
    code: 'EUR',
    symbol: '€',
    hint: 'Valor en euros',
    mask: '#.###.###.###',
    formatter: formatEuro,
  },
  {
    label: 'Reales',
    value: 'BRL',
    code: 'BRL',
    symbol: 'R$',
    hint: 'Valor en reales',
    mask: '#.###.###.###,##',
    formatter: formatReal,
  },
  {
    label: 'Pesos Mexicanos',
    value: 'MXN',
    code: 'MXN',
    symbol: '$',
    hint: 'Valor en pesos mexicanos',
    mask: '#,###,###,###.##',
    formatter: formatPesoMexicano,
  },
  {
    label: 'Soles',
    value: 'PEN',
    code: 'PEN',
    symbol: 'S/',
    hint: 'Valor en soles',
    mask: '#,###,###,###.00',
    formatter: formatSol,
  },
  {
    label: 'Riales Saudíes',
    value: 'SAR',
    code: 'SAR',
    symbol: '﷼',
    hint: 'Valor en riales saudíes',
    mask: '#,###,###,###.##',
    formatter: formatRialSaudi,
  },
];
