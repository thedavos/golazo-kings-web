interface HomeTab {
  name: string;
  icon: string;
  iconSize: string;
  label?: string;
}

export const HOME_TAB_ICON_SIZE = '16px';

export const HOME_TABS_DATA: HomeTab[] = [
  {
    name: 'home',
    icon: 'fa fa-crown',
    iconSize: HOME_TAB_ICON_SIZE,
    label: 'Inicio',
  },
  {
    name: 'explore_players',
    icon: 'fa fa-magnifying-glass',
    iconSize: HOME_TAB_ICON_SIZE,
    label: 'Buscar jugadores',
  },
  {
    name: 'lineup',
    icon: 'fa fa-bullseye',
    iconSize: HOME_TAB_ICON_SIZE,
    label: 'Crear alineación',
  },
  {
    name: 'guess-template',
    icon: 'fa fa-gamepad',
    iconSize: HOME_TAB_ICON_SIZE,
    label: 'Adivina la plantilla',
  },
  {
    name: 'salary-distribution',
    icon: 'fa fa-money-bill',
    iconSize: HOME_TAB_ICON_SIZE,
    label: 'Reparto salarios',
  },
];
