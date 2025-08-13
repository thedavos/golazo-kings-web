export interface TeamDto {
  id: number;
  uuid: string;
  slug: string;
  name: string;
  referenceId: number | null;
  referenceUrl: string | null;
  abbr: string | null;
  logoUrl: string | null;
  city: string;
  country: string;
  foundationYear: number | null;
  venue: string | null;
  leagueId: number | null;
  isQueensLeagueTeam: boolean;
  createdAt: string;
  updatedAt: string;
}
