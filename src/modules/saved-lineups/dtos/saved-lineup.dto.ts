import type { PlayerDto } from 'src/modules/players/dtos/player.dto';
import type { LineupPlayer, FieldSlot, FormationOption, CurrencyOption } from 'src/modules/lineup-builder/types';
import type { TeamSelectOption } from 'src/modules/lineup-builder/constants/team.constant';
import type { CoachSelectOption } from 'src/modules/lineup-builder/constants/coach.constant';

/**
 * DTO para transferencia de datos de alineaciones guardadas
 * Se usa para serialización/deserialización con IndexedDB
 */
export interface SavedLineupDto {
  id: string;
  name: string;
  createdAt: string; // ISO string para serialización
  updatedAt: string; // ISO string para serialización
  formation: FormationOption;
  team: TeamSelectOption | null;
  coach: CoachSelectOption | null;
  budget: number;
  currency: CurrencyOption;
  players: LineupPlayer[];
  fieldSlots: Array<[string, FieldSlot]>; // Map serializado como array de entries
  showTeamInLineup: boolean;
  showCoachInLineup: boolean;
  playersModified: PlayerDto[];
}

/**
 * DTO ligero para listados y previews
 */
export interface SavedLineupSummaryDto {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  formation: string; // Solo el label de la formación
  teamName: string | null;
  coachName: string | null;
  playersCount: number;
  fieldPlayersCount: number;
  benchPlayersCount: number;
  totalBudget: number;
  spentBudget: number;
  isComplete: boolean;
}

/**
 * DTO para crear una nueva alineación guardada
 */
export interface CreateSavedLineupDto {
  name: string;
  formation: FormationOption;
  team: TeamSelectOption | null;
  coach: CoachSelectOption | null;
  budget: number;
  currency: CurrencyOption;
  players: LineupPlayer[];
  fieldSlots: Map<string, FieldSlot>;
  showTeamInLineup: boolean;
  showCoachInLineup: boolean;
  playersModified: PlayerDto[];
}

/**
 * DTO para actualizar una alineación existente
 */
export interface UpdateSavedLineupDto {
  id: string;
  name?: string;
  formation?: FormationOption;
  team?: TeamSelectOption | null;
  coach?: CoachSelectOption | null;
  budget?: number;
  currency?: CurrencyOption;
  players?: LineupPlayer[];
  fieldSlots?: Map<string, FieldSlot>;
  showTeamInLineup?: boolean;
  showCoachInLineup?: boolean;
  playersModified?: PlayerDto[];
}