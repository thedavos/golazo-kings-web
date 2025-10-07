import type { SelectOption, SelectOptionList } from 'src/modules/lineup-builder/types';

export const DEFAULT_OPTION: SelectOption = {
  label: 'Todas las ligas',
  value: 'all',
  description: '',
  icon: 'la la-chess',
  color: 'text-black-400',
  type: 'all',
};

export const LIST_OPTIONS: SelectOptionList = [
  {
    label: 'Kings League',
    value: 'kings',
    description: 'Liga masculina',
    icon: 'fa fa-chess-king',
    color: 'text-yellow-400',
    type: 'kings',
  },
  {
    label: 'Kings League España',
    value: '1',
    description: 'Liga masculina',
    icon: 'fa fa-chess-king',
    color: 'text-yellow-400',
    type: 'kings',
  },
  {
    label: 'Kings League Américas',
    value: '3',
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
    value: '2',
    description: 'Liga femenina',
    icon: 'fa fa-chess-queen',
    color: 'text-blue-400',
    type: 'queens',
  },
  {
    label: 'Queens League Américas',
    value: '9',
    description: 'Liga femenina',
    icon: 'fa fa-chess-queen',
    color: 'text-blue-400',
    type: 'queens',
  },
];
