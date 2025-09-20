interface HomeTab {
  name: string;
  icon?: string;
  iconSize?: string;
  label?: string;
  to?: string;
}

export const HOME_TAB_ICON_SIZE = '16px';

export const HOME_TABS_CONFIG: HomeTab[] = [
  {
    name: 'home',
    iconSize: HOME_TAB_ICON_SIZE,
    label: 'Crea tu alineación',
    to: '/',
  },
  // {
  //   name: 'explore_players',
  //   iconSize: HOME_TAB_ICON_SIZE,
  //   label: 'Buscar jugadores',
  //   to: '/explore-players',
  // },
  {
    name: 'lineup',
    iconSize: HOME_TAB_ICON_SIZE,
    label: 'Mis alineaciones',
    to: '/lineups',
  },
  // {
  //   name: 'guess-roster',
  //   icon: 'fa fa-gamepad',
  //   iconSize: HOME_TAB_ICON_SIZE,
  //   label: 'Adivina la plantilla',
  //   to: '/guess-roster',
  // },
  // {
  //   name: 'budget-division',
  //   icon: 'fa fa-money-bill',
  //   iconSize: HOME_TAB_ICON_SIZE,
  //   label: 'Reparto de salarios',
  //   to: '/budget',
  // },
];
