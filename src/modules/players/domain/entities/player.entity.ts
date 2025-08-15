import type { Team } from 'src/modules/teams/domain/entities/team.entity';
import type { PlayerStats } from './player-stats.entity';
import type {
  PlayerPosition,
  PlayerPositionAbbreviation,
} from '../value-objects/player-position.enum';
// import { getAge } from 'src/modules/shared/utils/getAge.util';
import { PlayerWildcardType } from '../value-objects/player-wildcard-type.enum';
import type { PlayerPreferredFoot } from '../value-objects/player-preferred-foot.enum';

export class Player {
  id: number;
  uuid: string;
  slug: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  height?: number | null; // En metros
  weight?: number | null; // En kg
  isActive: boolean;
  marketValue?: number | null;
  profileImageUrl?: string | null;
  position?: PlayerPosition | null;
  positionAbbreviation?: PlayerPositionAbbreviation | null;
  preferredFoot?: PlayerPreferredFoot | null;
  jerseyNumber?: number | null;
  birthDate?: Date;
  nationality?: string | null;
  socialMediaHandle?: string | null;
  isWildCard: boolean;
  wildCardType?: PlayerWildcardType | null;
  wildCardDescription?: string | null;
  formerTeam?: string | null;
  referenceId?: number | null;
  referenceUrl?: string | null;
  rating?: number | null;
  teamId: number;
  teamUuid: string;
  team?: Team;
  seasonStats?: PlayerStats[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: Partial<Player> = {}) {
    this.id = data.id || 0;
    this.uuid = data.uuid || '';
    this.slug = data.slug || '';
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.nickname = data.nickname || '';
    this.height = data.height || null;
    this.weight = data.weight || null;
    this.isActive = data.isActive ?? true;
    this.isWildCard = data.isWildCard ?? false;
    this.referenceId = data.referenceId || null;
    this.referenceUrl = data.referenceUrl || null;
    this.rating = data.rating || null;
    this.teamId = data.teamId || 0;
    this.teamUuid = data.teamUuid || '';
    this.seasonStats = data.seasonStats || [];

    if (data.positionAbbreviation) this.positionAbbreviation = data.positionAbbreviation;
    if (data.preferredFoot) this.preferredFoot = data.preferredFoot;
    if (data.jerseyNumber) this.jerseyNumber = data.jerseyNumber;
    if (data.birthDate) this.birthDate = new Date(data.birthDate);
    if (data.nationality) this.nationality = data.nationality;
    if (data.socialMediaHandle) this.socialMediaHandle = data.socialMediaHandle;
    if (data.wildCardType) this.wildCardType = data.wildCardType;
    if (data.wildCardDescription) this.wildCardDescription = data.wildCardDescription;
    if (data.formerTeam) this.formerTeam = data.formerTeam;
    if (data.position) this.position = data.position;
    if (data.profileImageUrl) this.profileImageUrl = data.profileImageUrl;
    if (data.marketValue) this.marketValue = data.marketValue;
    if (data.team) this.team = data.team;
    if (data.updatedAt) this.updatedAt = new Date(data.updatedAt);
    if (data.createdAt) this.createdAt = new Date(data.createdAt);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get displayName(): string {
    return this.nickname || this.fullName;
  }

  // get age(): number | null {
  //   if (!this.birthDate) return null;
  //   return getAge(this.birthDate);
  // }

  get bmi(): number | null {
    if (!this.height || !this.weight) return null;
    return this.weight / (this.height * this.height);
  }

  // ====== GETTERS ESPECÍFICOS PARA KINGS LEAGUE ======
  get isDraftPlayer(): boolean {
    return !this.isWildCard;
  }

  get isSpecialGuest(): boolean {
    return this.isWildCard && this.wildCardType === PlayerWildcardType.SPECIAL_GUEST;
  }

  get isStreamer(): boolean {
    return this.isWildCard && this.wildCardType === PlayerWildcardType.STREAMER;
  }

  get isInfluencer(): boolean {
    return this.isWildCard && this.wildCardType === PlayerWildcardType.INFLUENCER;
  }

  get isLegendPlayer(): boolean {
    return this.isWildCard && this.wildCardType === PlayerWildcardType.LEGEND;
  }

  get isFirstDivisionPlayer(): boolean {
    return this.isWildCard && this.wildCardType === PlayerWildcardType.FIRST_DIVISION;
  }

  get isSecondDivisionPlayer(): boolean {
    return this.isWildCard && this.wildCardType === PlayerWildcardType.SECOND_DIVISION;
  }

  get isRegularWildCard(): boolean {
    return this.isWildCard && this.wildCardType === PlayerWildcardType.REGULAR;
  }

  get isContentCreator(): boolean {
    return this.isStreamer || this.isInfluencer;
  }

  get playerCategory(): string {
    if (this.isDraftPlayer) {
      return 'Draft';
    }

    return 'WildCard';
  }

  get hasSpecialBackground(): boolean {
    return (
      this.isFirstDivisionPlayer ||
      this.isSecondDivisionPlayer ||
      this.isLegendPlayer ||
      this.isContentCreator
    );
  }

  get currentSeasonRating(): number | null {
    if (!this.seasonStats) return null;
    const currentSeason = this.seasonStats.find((stat) => !!stat.season?.isActive);
    return currentSeason?.averageRating || null;
  }

  get careerRating(): number | null {
    if (!this.seasonStats) return null;
    const allRatings = this.seasonStats
      .filter((stat) => stat.averageRating !== null)
      .map((stat) => stat.averageRating || 0);

    if (allRatings.length === 0) return null;

    return allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length;
  }

  get bestSeasonRating(): number | null {
    if (!this.seasonStats) return null;
    const ratings = this.seasonStats
      .filter((stat) => stat.averageRating !== null)
      .map((stat) => stat.averageRating || 0);

    return ratings.length > 0 ? Math.max(...ratings) : null;
  }
}
