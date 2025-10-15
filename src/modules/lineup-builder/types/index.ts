import type {
  PlayerPosition,
  PlayerPositionAbbreviation,
} from 'src/modules/players/domain/value-objects/player-position.enum';
import type { TeamSelectOption } from 'src/modules/lineup-builder/constants/team.constant';
import type { PlayerPositionSelectOption } from 'src/modules/lineup-builder/constants/playerPosition.constant';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';

export interface SelectOption {
  label: string;
  value: string;
  description?: string;
  icon?: string;
  color?: string;
  type?: string;
}

export type SelectOptionList = SelectOption[];

export interface CurrencyOption {
  label: string;
  value: string;
  code: string;
  symbol: string;
  mask: string;
  hint: string;
  formatter: (amount: number) => string;
}

export type CurrencyOptionList = CurrencyOption[];

export interface FieldPosition {
  id: string;
  x: number;
  y: number;
  position: PlayerPosition;
  abbreviation: PlayerPositionAbbreviation;
}

export interface BenchSlot {
  id: string;
  label: string;
}

export interface FormationOption {
  label: string;
  value: FormationName;
  description: string;
  players: string;
}

export type FieldPositions = FieldPosition[];

export type FormationName =
  | '4-2-0'
  | '3-2-1'
  | '3-1-2'
  | '2-3-1'
  | '5-1-0'
  | '1-2-3'
  | 'Personalizado';

export type FormationConfigurationType = Record<
  Exclude<FormationName, 'Personalizado'>,
  FieldPositions
>;

export type BenchSlotList = BenchSlot[];

export interface Filter {
  league?: SelectOption;
  team?: TeamSelectOption;
  position?: PlayerPositionSelectOption;
}

export interface LineupPlayer {
  player: PlayerDto;
  slotId?: string | undefined | null;
  isBench: boolean;
}

export interface PlayerSlot {
  id: string;
  name: string;
  playerId: number | null;
  position: PlayerPositionAbbreviation | null;
  isBench: boolean;
  x: number | null;
  y: number | null;
}

export interface FieldSlot {
  x: number;
  y: number;
}

export interface FieldArea {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

export type LEAGUE_TYPES = 'kings' | 'queens' | 'all';

// Custom entities types
export type {
  CustomPlayer,
  CustomTeam,
  CustomCoach,
  CustomPlayerFormData,
  CustomTeamFormData,
  CustomCoachFormData,
} from './custom-entities.types';
