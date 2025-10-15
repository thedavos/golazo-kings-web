import type { PlayerDto } from 'src/modules/players/dtos/player.dto';
import type { TeamSelectOption } from 'src/modules/lineup-builder/constants/team.constant';
import type { CoachSelectOption } from 'src/modules/lineup-builder/constants/coach.constant';

/**
 * Los jugadores personalizados son PlayerDto con isCustomEntity = true
 * Se generan con IDs numéricos únicos usando un generador
 */
export type CustomPlayer = PlayerDto;

/**
 * Los equipos personalizados son TeamSelectOption con isCustomEntity = true
 */
export type CustomTeam = TeamSelectOption;

/**
 * Los entrenadores personalizados son CoachSelectOption con isCustomEntity = true
 */
export type CustomCoach = CoachSelectOption;

/**
 * Datos para formulario de jugador personalizado
 */
export interface CustomPlayerFormData {
  firstName: string;
  lastName: string;
  nickname: string | null;
  marketValue: number | null;
  rating: number | null;
  team: string;
  teamLogo: string;
  leagueId: number | null;
  profileImageUrl: string | null;
  positionAbbreviation: string;
  isQueensLeaguePlayer: boolean;
}

/**
 * Datos para formulario de equipo personalizado
 */
export interface CustomTeamFormData {
  label: string;
  value: string;
  description: string;
  logo: string;
  leagueId: number;
  color: string;
  type: 'kings' | 'queens';
}

/**
 * Datos para formulario de entrenador personalizado
 */
export interface CustomCoachFormData {
  label: string;
  value: string;
  photoUrl: string;
}
