import {
  DEFAULT_OPTION,
  LIST_OPTIONS,
} from 'src/modules/lineup-builder/constants/currency.constant';
import {
  DEFAULT_FORMATION,
  FORMATION_OPTIONS,
  FORMATION_CONFIGURATION,
} from 'src/modules/lineup-builder/constants/formation.constant';
import {
  DEFAULT_OPTION as LEAGUE_DEFAULT_OPTIONS,
  LIST_OPTIONS as LEAGUE_LIST_OPTIONS,
} from 'src/modules/lineup-builder/constants/league.constant';
import {
  DEFAULT_OPTION as TEAM_DEFAULT_OPTION,
  LIST_OPTIONS as TEAM_LIST_OPTIONS,
  MAP_OPTIONS as TEAM_MAP_OPTIONS,
} from 'src/modules/lineup-builder/constants/team.constant';
import {
  DEFAULT_OPTION as COACH_DEFAULT_OPTION,
  LIST_OPTIONS as COACH_LIST_OPTIONS,
} from 'src/modules/lineup-builder/constants/coach.constant';
import { DEFAULT_TOTAL } from 'src/modules/lineup-builder/constants/budget.constant';
import {
  DEFAULT_OPTION as PLAYER_POSITION_DEFAULT_OPTION,
  LIST_OPTIONS as PLAYER_POSITION_LIST_OPTIONS,
} from './playerPosition.constant';
import { FILTERS_KEY } from './filters.constant';
import { ORDER_BY_DEFAULT, LIST_OPTIONS as ORDER_BY_LIST_OPTIONS } from './orderBy.constant';
import { PLAYER_IN_BENCH_SLOTS, PLAYER_IN_FIELD_SLOTS } from './playerSlots.constant';

export const CONST = {
  CURRENCY: {
    DEFAULT_OPTION,
    LIST_OPTIONS,
  },
  FORMATION: {
    DEFAULT_FORMATION,
    FORMATION_OPTIONS,
    FORMATION_CONFIGURATION,
  },
  LEAGUE: {
    DEFAULT_OPTION: LEAGUE_DEFAULT_OPTIONS,
    LIST_OPTIONS: LEAGUE_LIST_OPTIONS,
  },
  TEAM: {
    DEFAULT_OPTION: TEAM_DEFAULT_OPTION,
    LIST_OPTIONS: TEAM_LIST_OPTIONS,
    MAP_OPTIONS: TEAM_MAP_OPTIONS,
  },
  COACH: {
    DEFAULT_OPTION: COACH_DEFAULT_OPTION,
    LIST_OPTIONS: COACH_LIST_OPTIONS,
  },
  PLAYER_POSITION: {
    DEFAULT_OPTION: PLAYER_POSITION_DEFAULT_OPTION,
    LIST_OPTIONS: PLAYER_POSITION_LIST_OPTIONS,
  },
  BUDGET: {
    DEFAULT_TOTAL,
  },
  FILTER: {
    KEY: FILTERS_KEY,
  },
  ORDER_BY: {
    DEFAULT: ORDER_BY_DEFAULT,
    LIST_OPTIONS: ORDER_BY_LIST_OPTIONS,
  },
  LINEUP: {
    PLAYER_IN_FIELD_SLOTS,
    PLAYER_IN_BENCH_SLOTS,
  },
};
