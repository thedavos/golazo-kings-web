import type {
  PlayerPosition,
  PlayerPositionAbbreviation,
} from '../domain/value-objects/player-position.enum';
import type { PlayerPreferredFoot } from '../domain/value-objects/player-preferred-foot.enum';
import type { PlayerWildcardType } from '../domain/value-objects/player-wildcard-type.enum';

export interface PlayerDto {
  id: number;
  uuid: string;
  slug: string;
  firstName: string;
  lastName: string;
  nickname?: string | undefined | null;
  height?: number | undefined | null;
  weight?: number | undefined | null;
  isActive: boolean;
  marketValue?: number | undefined | null;
  profileImageUrl?: string | undefined | null;
  position?: PlayerPosition | undefined | null;
  positionAbbreviation?: PlayerPositionAbbreviation | undefined | null;
  preferredFoot?: PlayerPreferredFoot | undefined | null;
  jerseyNumber?: number | undefined | null;
  birthDate?: string | undefined | null;
  nationality?: string | undefined | null;
  socialMediaHandle?: string | undefined | null;
  isWildCard: boolean;
  wildCardType?: PlayerWildcardType | undefined | null;
  wildCardDescription?: string | undefined | null;
  formerTeam?: string | undefined | null;
  referenceId?: number | undefined | null;
  referenceUrl?: string | undefined | null;
  team?: string;
  teamId: number;
  teamUuid: string;
  createdAt: string;
  updatedAt: string;
}
