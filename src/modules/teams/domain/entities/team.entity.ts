// {
//   "id": 1,
//   "uuid": "db2f0613-cacf-4e49-bcca-da46f3d06915",
//   "slug": "pio-fc",
//   "name": "PIO FC",
//   "abbr": null,
//   "logoUrl": null,
//   "city": "Barcelona",
//   "country": "España",
//   "foundationYear": null,
//   "venue": null,
//   "leagueId": 1,
//   "createdAt": "2025-06-03T21:59:50.840Z",
//   "updatedAt": "2025-06-03T21:59:50.840Z"
// }

export class Team {
  public readonly id: number;
  public readonly uuid: string;
  public readonly slug: string;
  public readonly name: string;
  public readonly referenceId: number | null;
  public readonly referenceUrl: string | null;
  public readonly abbr: string | null;
  public readonly logoUrl: string | null;
  public readonly city: string;
  public readonly country: string;
  public readonly foundationYear: number | null;
  public readonly venue: string | null;
  public readonly leagueId: number | null;
  public readonly isQueensLeagueTeam: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(data: {
    id: number;
    uuid: string;
    slug: string;
    name: string;
    referenceId: number | null;
    referenceUrl: string | null;
    abbr: string | null;
    city: string;
    country: string;
    foundationYear: number | null;
    venue: string | null;
    logoUrl: string | null;
    leagueId: number | null;
    isQueensLeagueTeam: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.uuid = data.uuid;
    this.slug = data.slug;
    this.name = data.name;
    this.referenceId = data.referenceId;
    this.referenceUrl = data.referenceUrl;
    this.abbr = data.abbr;
    this.city = data.city;
    this.country = data.country;
    this.foundationYear = data.foundationYear;
    this.venue = data.city;
    this.logoUrl = data.logoUrl;
    this.leagueId = data.leagueId;
    this.isQueensLeagueTeam = data.isQueensLeagueTeam;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Gets the full location string
   * @returns {string} City, Country format
   */
  get fullLocation() {
    if (this.city && this.country) {
      return `${this.city}, ${this.country}`;
    }
    return this.city || this.country || '';
  }

  /**
   * Checks if team has a logo
   * @returns {boolean} True if team has logo URL
   */
  get hasLogo() {
    return Boolean(this.logoUrl);
  }
}
