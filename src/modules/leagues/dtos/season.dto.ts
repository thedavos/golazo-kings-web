export interface SeasonDto {
  id: number;
  uuid: string;
  name: string;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
  leagueId: number;
}
