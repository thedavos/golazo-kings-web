import { Season } from 'src/modules/leagues/domain/entities/season.entity';
import type { SeasonDto } from 'src/modules/leagues/dtos/season.dto';

export class SeasonMapper {
  public static toDto(entity: Season): SeasonDto {
    const dto = {} as SeasonDto;
    dto.id = entity.id;
    dto.name = entity.name;
    dto.startDate = entity.startDate;
    dto.endDate = entity.endDate;
    dto.isActive = entity.isActive;

    return dto;
  }

  public static toEntity(dto: SeasonDto): Season {
    return new Season(
      dto.id,
      dto.uuid,
      dto.name,
      dto.startDate,
      dto.endDate,
      dto.isActive,
      dto.leagueId,
    );
  }
}
