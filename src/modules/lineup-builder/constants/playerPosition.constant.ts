import type { SelectOption } from 'src/modules/lineup-builder/types';

export interface PlayerPositionSelectOption extends SelectOption {
  abbreviation: string;
  type: string;
}

export type PlayerPositionSelectOptionList = PlayerPositionSelectOption[];

export const DEFAULT_OPTION: PlayerPositionSelectOption = {
  label: 'Todas las posiciones',
  value: '',
  abbreviation: '',
  type: 'all',
};

export const LIST_OPTIONS: PlayerPositionSelectOptionList = [
  {
    ...DEFAULT_OPTION,
  },
  {
    value: 'Defensa',
    label: 'Defensa',
    abbreviation: 'DF',
    type: 'all',
  },
  {
    value: 'Delantera Centro',
    label: 'Delantera Centro',
    abbreviation: 'DC',
    type: 'queens',
  },
  {
    value: 'Delantero Centro',
    label: 'Delantero Centro',
    abbreviation: 'DC',
    type: 'kings',
  },
  {
    value: 'Medio Centro',
    label: 'Medio Centro',
    abbreviation: 'MC',
    type: 'all',
  },
  {
    value: 'Portera',
    label: 'Portera',
    abbreviation: 'PO',
    type: 'queens',
  },
  {
    value: 'Portero',
    label: 'Portero',
    abbreviation: 'PO',
    type: 'kings',
  },
];
