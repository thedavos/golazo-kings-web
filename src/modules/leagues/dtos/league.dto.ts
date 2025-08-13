import type { SeasonDto } from 'src/modules/leagues/dtos/season.dto';

export interface LeagueDto {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  abbr: string;
  country: string;
  city: string;
  logoUrl: string | null;
  foundationYear: number | null;
  website: string | null;
  venue: string | null;
  twitterHandle: string | null;
  instagramHandle: string | null;
  numberOfTeams: number;
  description: string;
  rules: string | null;
  status: string;
  isActive: boolean;
  isVisible: boolean;
  seasons: SeasonDto[];
  createdAt: string;
  updatedAt: string;
}
