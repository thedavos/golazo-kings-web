import type { Player } from './player.entity';
import type { Season } from 'src/modules/leagues/domain/entities/season.entity';

export class PlayerStats {
  id: number;
  playerId: number;
  seasonId: number;
  matchesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  averageRating?: number;
  player?: Player;
  season?: Season;

  constructor(data: Partial<PlayerStats> = {}) {
    this.id = data.id || 0;
    this.playerId = data.playerId || 0;
    this.seasonId = data.seasonId || 0;
    this.matchesPlayed = data.matchesPlayed || 0;
    this.goals = data.goals || 0;
    this.assists = data.assists || 0;
    this.yellowCards = data.yellowCards || 0;
    this.redCards = data.redCards || 0;
    this.minutesPlayed = data.minutesPlayed || 0;

    if (data.averageRating) this.averageRating = data.averageRating;
    if (data.player) this.player = data.player;
  }

  // Métodos de utilidad
  get totalGoalsAndAssists(): number {
    return this.goals + this.assists;
  }

  get totalCards(): number {
    return this.yellowCards + this.redCards;
  }

  get averageMinutesPerMatch(): number {
    return this.matchesPlayed > 0 ? this.minutesPlayed / this.matchesPlayed : 0;
  }

  get goalsPerMatch(): number {
    return this.matchesPlayed > 0 ? this.goals / this.matchesPlayed : 0;
  }

  get assistsPerMatch(): number {
    return this.matchesPlayed > 0 ? this.assists / this.matchesPlayed : 0;
  }

  get hasPlayedMatches(): boolean {
    return this.matchesPlayed > 0;
  }

  get isActivePlayer(): boolean {
    return this.minutesPlayed > 0;
  }
}
