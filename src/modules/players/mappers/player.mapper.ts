import { Player } from '../domain/entities/player.entity';
import type { PlayerDto } from '../dtos/player.dto';

export class PlayerMapper {
  static fromDto(dto: PlayerDto): Player {
    return new Player({
      id: dto.id,
      uuid: dto.uuid,
      slug: dto.slug,
      firstName: dto.firstName,
      lastName: dto.lastName,
      nickname: dto.nickname,
      height: dto.height,
      weight: dto.weight,
      isActive: dto.isActive,
      marketValue: dto.marketValue,
      profileImageUrl: dto.profileImageUrl,
      position: dto.position,
      positionAbbreviation: dto.positionAbbreviation,
      preferredFoot: dto.preferredFoot,
      jerseyNumber: dto.jerseyNumber,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      nationality: dto.nationality,
      socialMediaHandle: dto.socialMediaHandle,
      isWildCard: dto.isWildCard,
      wildCardType: dto.wildCardType,
      wildCardDescription: dto.wildCardDescription,
      formerTeam: dto.formerTeam,
      referenceId: dto.referenceId,
      referenceUrl: dto.referenceUrl,
      teamId: dto.teamId,
      teamUuid: dto.teamUuid,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
    } as Partial<Player>);
  }

  static toDto(player: Player): PlayerDto {
    return {
      id: player.id,
      uuid: player.uuid,
      slug: player.slug,
      firstName: player.firstName,
      lastName: player.lastName,
      nickname: player.nickname,
      height: player.height || null,
      weight: player.weight || null,
      isActive: player.isActive,
      marketValue: player.marketValue || null,
      profileImageUrl: player.profileImageUrl || null,
      position: player.position || null,
      positionAbbreviation: player.positionAbbreviation || null,
      preferredFoot: player.preferredFoot || null,
      jerseyNumber: player.jerseyNumber || null,
      birthDate: player.birthDate ? player.birthDate.toISOString().split('T')[0] : null,
      nationality: player.nationality || null,
      socialMediaHandle: player.socialMediaHandle || null,
      isWildCard: player.isWildCard,
      wildCardType: player.wildCardType || null,
      wildCardDescription: player.wildCardDescription || null,
      formerTeam: player.formerTeam || null,
      referenceId: player.referenceId || null,
      referenceUrl: player.referenceUrl || null,
      teamId: player.teamId,
      teamUuid: player.teamUuid,
      createdAt: player.createdAt!.toISOString(),
      updatedAt: player.updatedAt!.toISOString(),
    };
  }

  static fromDtos(dtos: PlayerDto[]): Player[] {
    return dtos.map((dto) => PlayerMapper.fromDto(dto));
  }

  static toDtos(players: Player[]): PlayerDto[] {
    return players.map((player) => PlayerMapper.toDto(player));
  }
}

export default PlayerMapper;
