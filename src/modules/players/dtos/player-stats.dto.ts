export interface PlayerStatsDto {
  id: number;
  playerId: number;
  seasonId: number;
  matchesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  averageRating: number | null;
}
