import { Team } from 'src/modules/teams/domain/entities/team.entity';
import type { TeamDto } from 'src/modules/teams/dtos/team.dto';

export class TeamMapper {
  static fromDto(dto: TeamDto): Team {
    return new Team({
      id: dto.id,
      uuid: dto.uuid,
      slug: dto.slug,
      name: dto.name,
      abbr: dto.abbr,
      logoUrl: dto.logoUrl,
      city: dto.city,
      country: dto.country,
      foundationYear: dto.foundationYear,
      venue: dto.venue,
      leagueId: dto.leagueId,
      referenceId: dto.referenceId,
      referenceUrl: dto.referenceUrl,
      isQueensLeagueTeam: dto.isQueensLeagueTeam,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
    });
  }

  /**
   * Maps a Team entity to a TeamDTO
   * @param team - Team entity
   * @returns TeamDTO object
   */
  static toDto(team: Team): TeamDto {
    return {
      id: team.id,
      uuid: team.uuid,
      slug: team.slug,
      name: team.name,
      abbr: team.abbr,
      logoUrl: team.logoUrl,
      city: team.city,
      country: team.country,
      foundationYear: team.foundationYear,
      venue: team.venue,
      leagueId: team.leagueId,
      referenceId: team.referenceId,
      referenceUrl: team.referenceUrl,
      isQueensLeagueTeam: team.isQueensLeagueTeam,
      createdAt: team.createdAt.toISOString(),
      updatedAt: team.updatedAt.toISOString(),
    };
  }

  static fromDtos(dtos: TeamDto[]): Team[] {
    return dtos.map((dto) => TeamMapper.fromDto(dto));
  }

  static toDtos(teams: Team[]): TeamDto[] {
    return teams.map((team) => TeamMapper.toDto(team));
  }
}

export default TeamMapper;
