import { SavedLineupEntity, type SavedLineupConstructorData } from '../domain/entities/saved-lineup.entity';
import type {
  SavedLineupDto,
  SavedLineupSummaryDto,
  CreateSavedLineupDto,
  UpdateSavedLineupDto,
} from '../dtos/saved-lineup.dto';

/**
 * Mapper para convertir entre entidades SavedLineup y DTOs
 * Sigue el patrón establecido en el proyecto para separación de responsabilidades
 */
export class SavedLineupMapper {
  /**
   * Convierte una entidad a DTO para persistencia
   */
  static entityToDto(entity: SavedLineupEntity): SavedLineupDto {
    return {
      id: entity.id,
      name: entity.name,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      formation: entity.formation,
      team: entity.team,
      coach: entity.coach,
      budget: entity.budget,
      currency: entity.currency,
      players: entity.players,
      fieldSlots: Array.from(entity.fieldSlots.entries()), // Serializar Map como array
      showTeamInLineup: entity.showTeamInLineup,
      showCoachInLineup: entity.showCoachInLineup,
      playersModified: entity.playersModified,
    };
  }

  /**
   * Convierte un DTO a entidad para uso en dominio
   */
  static dtoToEntity(dto: SavedLineupDto): SavedLineupEntity {
    const constructorData: SavedLineupConstructorData = {
      id: dto.id,
      name: dto.name,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
      formation: dto.formation,
      team: dto.team,
      coach: dto.coach,
      budget: dto.budget,
      currency: dto.currency,
      players: dto.players,
      fieldSlots: new Map(dto.fieldSlots), // Deserializar array a Map
      showTeamInLineup: dto.showTeamInLineup,
      showCoachInLineup: dto.showCoachInLineup,
      playersModified: dto.playersModified,
    };

    return new SavedLineupEntity(constructorData);
  }

  /**
   * Convierte una entidad a DTO de resumen para listados
   */
  static entityToSummaryDto(entity: SavedLineupEntity): SavedLineupSummaryDto {
    const metadata = entity.getMetadata();
    const stats = entity.getStats();

    return {
      id: metadata.id,
      name: metadata.name,
      createdAt: metadata.createdAt.toISOString(),
      updatedAt: metadata.updatedAt.toISOString(),
      formation: metadata.formation,
      teamName: metadata.teamName,
      coachName: metadata.coachName,
      playersCount: metadata.playersCount,
      fieldPlayersCount: metadata.fieldPlayersCount,
      benchPlayersCount: metadata.benchPlayersCount,
      totalBudget: metadata.totalBudget,
      spentBudget: metadata.spentBudget,
      isComplete: stats.isComplete,
    };
  }

  /**
   * Convierte CreateSavedLineupDto a entidad
   */
  static createDtoToEntity(dto: CreateSavedLineupDto): SavedLineupEntity {
    const constructorData: SavedLineupConstructorData = {
      name: dto.name,
      formation: dto.formation,
      team: dto.team,
      coach: dto.coach,
      budget: dto.budget,
      currency: dto.currency,
      players: dto.players,
      fieldSlots: dto.fieldSlots,
      showTeamInLineup: dto.showTeamInLineup,
      showCoachInLineup: dto.showCoachInLineup,
      playersModified: dto.playersModified,
    };

    return new SavedLineupEntity(constructorData);
  }

  /**
   * Aplica UpdateSavedLineupDto a una entidad existente
   */
  static applyUpdateToEntity(entity: SavedLineupEntity, updateDto: UpdateSavedLineupDto): SavedLineupEntity {
    const updates: Partial<SavedLineupConstructorData> = {};

    // Solo aplicar campos que realmente han sido proporcionados
    if (updateDto.name !== undefined) updates.name = updateDto.name;
    if (updateDto.formation !== undefined) updates.formation = updateDto.formation;
    if (updateDto.team !== undefined) updates.team = updateDto.team;
    if (updateDto.coach !== undefined) updates.coach = updateDto.coach;
    if (updateDto.budget !== undefined) updates.budget = updateDto.budget;
    if (updateDto.currency !== undefined) updates.currency = updateDto.currency;
    if (updateDto.players !== undefined) updates.players = updateDto.players;
    if (updateDto.fieldSlots !== undefined) updates.fieldSlots = updateDto.fieldSlots;
    if (updateDto.showTeamInLineup !== undefined) updates.showTeamInLineup = updateDto.showTeamInLineup;
    if (updateDto.showCoachInLineup !== undefined) updates.showCoachInLineup = updateDto.showCoachInLineup;
    if (updateDto.playersModified !== undefined) updates.playersModified = updateDto.playersModified;

    return entity.update(updates);
  }

  /**
   * Convierte un array de DTOs a entidades
   */
  static dtosToEntities(dtos: SavedLineupDto[]): SavedLineupEntity[] {
    return dtos.map(dto => this.dtoToEntity(dto));
  }

  /**
   * Convierte un array de entidades a DTOs
   */
  static entitiesToDtos(entities: SavedLineupEntity[]): SavedLineupDto[] {
    return entities.map(entity => this.entityToDto(entity));
  }

  /**
   * Convierte un array de entidades a DTOs de resumen
   */
  static entitiesToSummaryDtos(entities: SavedLineupEntity[]): SavedLineupSummaryDto[] {
    return entities.map(entity => this.entityToSummaryDto(entity));
  }
}