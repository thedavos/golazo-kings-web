interface HomeTab {
  name: string;
  icon: string;
  iconSize: string;
  label?: string;
  to?: string;
}

export const HOME_TAB_ICON_SIZE = '16px';

export const HOME_TABS_CONFIG: HomeTab[] = [
  {
    name: 'home',
    icon: 'fa fa-crown',
    iconSize: HOME_TAB_ICON_SIZE,
    label: 'Inicio',
    to: '/',
  },
  {
    name: 'explore_players',
    icon: 'fa fa-magnifying-glass',
    iconSize: HOME_TAB_ICON_SIZE,
    label: 'Buscar jugadores',
    to: '/explore-players',
  },
  {
    name: 'lineup',
    icon: 'fa fa-bullseye',
    iconSize: HOME_TAB_ICON_SIZE,
    label: 'Crear alineación',
    to: '/lineups',
  },
  {
    name: 'guess-roster',
    icon: 'fa fa-gamepad',
    iconSize: HOME_TAB_ICON_SIZE,
    label: 'Adivina la plantilla',
    to: '/guess-roster',
  },
  {
    name: 'salary-division',
    icon: 'fa fa-money-bill',
    iconSize: HOME_TAB_ICON_SIZE,
    label: 'Reparto de salarios',
    to: '/salary-division',
  },
];
