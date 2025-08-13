import { SeasonMapper } from 'src/modules/leagues/mappers/season.mapper';
import { League } from 'src/modules/leagues/domain/entities/league.entity';
import type { LeagueDto } from 'src/modules/leagues/dtos/league.dto';
import type { LeagueStatus } from 'src/modules/leagues/domain/enums/league-status.enum';

export class LeagueMapper {
  public static toDto(entity: League): LeagueDto {
    const dto = {} as LeagueDto;

    dto.id = entity.id;
    dto.uuid = entity.uuid;
    dto.name = entity.name;
    dto.slug = entity.slug;
    dto.abbr = entity.abbr;
    dto.country = entity.country;
    dto.city = entity.city;
    dto.logoUrl = entity.logoUrl;
    dto.foundationYear = entity.foundationYear;
    dto.website = entity.website;
    dto.twitterHandle = entity.twitterHandle;
    dto.instagramHandle = entity.instagramHandle;
    dto.numberOfTeams = entity.numberOfTeams;
    dto.description = entity.description;
    dto.rules = entity.rules;
    dto.status = entity.status;
    dto.isActive = entity.isActive;
    dto.isVisible = entity.isVisible;
    dto.createdAt = entity.createdAt.toString();
    dto.updatedAt = entity.updatedAt.toString();

    dto.seasons = entity.seasons.map((season) => SeasonMapper.toDto(season));

    return dto;
  }

  /**
   * Convierte un LeagueDto de vuelta a una entidad League.
   * @param dto El objeto de transferencia de datos de la liga.
   * @returns Una instancia de la entidad League.
   */
  public static toEntity(dto: LeagueDto): League {
    // Mapeo de la relación anidada de DTO a Entidad
    const seasons = dto.seasons.map((seasonDto) => SeasonMapper.toEntity(seasonDto));

    // Se utiliza el constructor de la entidad para asegurar que la lógica
    // de negocio y la validación se apliquen al crear el objeto.
    return new League(
      dto.id,
      dto.uuid,
      dto.name,
      dto.slug,
      dto.abbr,
      dto.country,
      dto.city,
      dto.logoUrl,
      dto.foundationYear,
      dto.website,
      dto.twitterHandle,
      dto.instagramHandle,
      dto.numberOfTeams,
      dto.description,
      dto.rules,
      dto.status as LeagueStatus,
      dto.isActive,
      dto.isVisible,
      seasons,
      new Date(dto.createdAt),
      new Date(dto.updatedAt),
    );
  }
}
