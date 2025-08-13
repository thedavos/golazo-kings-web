export class Season {
  constructor(
    public readonly id: number,
    public readonly uuid: string,
    public readonly name: string,
    public readonly startDate: Date | null,
    public readonly endDate: Date | null,
    public readonly isActive: boolean,
    public readonly leagueId: number,
  ) {}
}
