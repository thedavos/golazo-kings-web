export interface LeagueOption {
  label: string;
  value: string;
  description: string;
  icon: string;
  color: string;
  type: string;
}

export type LeagueOptionList = LeagueOption[];

export interface CurrencyOption {
  label: string;
  value: string;
  code: string;
  symbol: string;
  mask: string;
  formatter: (amount: number) => string;
}

export type CurrencyOptionList = CurrencyOption[];
