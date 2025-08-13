import { PlayerStats } from '../domain/entities/player-stats.entity';
import type { PlayerStatsDto } from '../dtos/player-stats.dto';

export class PlayerStatsMapper {
  static fromDto(dto: PlayerStatsDto): PlayerStats {
    return new PlayerStats({
      id: dto.id,
      playerId: dto.playerId,
      seasonId: dto.seasonId,
      matchesPlayed: dto.matchesPlayed,
      goals: dto.goals,
      assists: dto.assists,
      yellowCards: dto.yellowCards,
      redCards: dto.redCards,
      minutesPlayed: dto.minutesPlayed,
      averageRating: dto.averageRating || 0,
    });
  }

  static toDto(playerStats: PlayerStats): PlayerStatsDto {
    return {
      id: playerStats.id,
      playerId: playerStats.playerId,
      seasonId: playerStats.seasonId,
      matchesPlayed: playerStats.matchesPlayed,
      goals: playerStats.goals,
      assists: playerStats.assists,
      yellowCards: playerStats.yellowCards,
      redCards: playerStats.redCards,
      minutesPlayed: playerStats.minutesPlayed,
      averageRating: playerStats.averageRating || null,
    };
  }

  static fromDtos(dtos: PlayerStatsDto[]): PlayerStats[] {
    return dtos.map((dto) => PlayerStatsMapper.fromDto(dto));
  }

  static toDtos(playerStats: PlayerStats[]): PlayerStatsDto[] {
    return playerStats.map((stats) => PlayerStatsMapper.toDto(stats));
  }
}

export default PlayerStatsMapper;
