import type {
  PlayerPosition,
  PlayerPositionAbbreviation,
} from 'src/modules/players/domain/value-objects/player-position.enum';

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
