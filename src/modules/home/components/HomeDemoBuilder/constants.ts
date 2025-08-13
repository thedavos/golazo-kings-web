import type { LeagueOptionList, LeagueOption } from './types';

export const LEAGUE_OPTION_DEFAULT: LeagueOption = {
  label: 'Kings League España',
  value: 'kings_esp',
  description: 'Liga masculina',
  icon: 'fa fa-crown',
  color: 'text-yellow-400',
  type: 'kings',
};

export const LEAGUE_OPTIONS: LeagueOptionList = [
  {
    ...LEAGUE_OPTION_DEFAULT,
  },
  {
    label: 'Kings League Américas',
    value: 'kings_am',
    description: 'Liga masculina',
    icon: 'fa fa-crown',
    color: 'text-yellow-400',
    type: 'kings',
  },
  {
    label: 'Kings League Brasil',
    value: 'kings_br',
    description: 'Liga masculina',
    icon: 'fa fa-crown',
    color: 'text-yellow-400',
    type: 'kings',
  },
  {
    label: 'Queens League España',
    value: 'queens_esp',
    description: 'Liga femenina',
    icon: 'fa fa-crown',
    color: 'text-blue-400',
    type: 'queens',
  },
  {
    label: 'Queens League Américas',
    value: 'queens_am',
    description: 'Liga femenina',
    icon: 'fa fa-crown',
    color: 'text-blue-400',
    type: 'queens',
  },
];
