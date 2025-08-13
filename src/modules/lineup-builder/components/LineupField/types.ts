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

export type FieldPositions = FieldPosition[];

export type FormationName = '4-2-0' | '3-2-1' | '3-1-2' | '2-3-1' | '5-1-0' | '1-2-3';

export type FormationConfigurationType = Record<FormationName, FieldPositions>;
