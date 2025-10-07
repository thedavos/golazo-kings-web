import type { PlayerDto } from 'src/modules/players/dtos/player.dto';
import type { LineupPlayer, FieldSlot, FormationOption, CurrencyOption } from 'src/modules/lineup-builder/types';
import type { TeamSelectOption } from 'src/modules/lineup-builder/constants/team.constant';
import type { CoachSelectOption } from 'src/modules/lineup-builder/constants/coach.constant';

export class SavedLineupEntity {
  public readonly id: string;
  public readonly name: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly formation: FormationOption;
  public readonly team: TeamSelectOption | null;
  public readonly coach: CoachSelectOption | null;
  public readonly budget: number;
  public readonly currency: CurrencyOption;
  public readonly players: LineupPlayer[];
  public readonly fieldSlots: Map<string, FieldSlot>;
  public readonly showTeamInLineup: boolean;
  public readonly showCoachInLineup: boolean;
  public readonly playersModified: PlayerDto[];

  constructor(data: SavedLineupConstructorData) {
    this.id = data.id || this.generateId();
    this.name = data.name;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.formation = data.formation;
    this.team = data.team;
    this.coach = data.coach;
    this.budget = data.budget;
    this.currency = data.currency;
    this.players = data.players;
    this.fieldSlots = data.fieldSlots;
    this.showTeamInLineup = data.showTeamInLineup;
    this.showCoachInLineup = data.showCoachInLineup;
    this.playersModified = data.playersModified;

    this.validate();
  }

  /**
   * Valida que la entidad tenga datos válidos
   */
  private validate(): void {
    if (!this.name?.trim()) {
      throw new Error('El nombre de la alineación es requerido');
    }

    if (!this.formation) {
      throw new Error('La formación es requerida');
    }

    if (this.budget < 0) {
      throw new Error('El presupuesto no puede ser negativo');
    }

    if (!Array.isArray(this.players)) {
      throw new Error('La lista de jugadores debe ser un array');
    }
  }

  /**
   * Genera un ID único para la alineación
   */
  private generateId(): string {
    return `lineup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Crea una copia actualizada de la entidad
   */
  public update(updates: Partial<SavedLineupConstructorData>): SavedLineupEntity {
    return new SavedLineupEntity({
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
      updatedAt: new Date(),
      formation: this.formation,
      team: this.team,
      coach: this.coach,
      budget: this.budget,
      currency: this.currency,
      players: this.players,
      fieldSlots: this.fieldSlots,
      showTeamInLineup: this.showTeamInLineup,
      showCoachInLineup: this.showCoachInLineup,
      playersModified: this.playersModified,
      ...updates,
    });
  }

  /**
   * Obtiene metadatos básicos de la alineación
   */
  public getMetadata(): SavedLineupMetadata {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      formation: this.formation.label,
      teamName: this.team?.label || null,
      coachName: this.coach?.label || null,
      playersCount: this.players.length,
      fieldPlayersCount: this.players.filter(p => !p.isBench).length,
      benchPlayersCount: this.players.filter(p => p.isBench).length,
      totalBudget: this.budget,
      spentBudget: this.calculateSpentBudget(),
    };
  }

  /**
   * Calcula el presupuesto gastado
   */
  private calculateSpentBudget(): number {
    return this.players.reduce((acc, lp) => {
      if (lp.player.marketValue === null || lp.player.marketValue === undefined) {
        return acc;
      }
      return acc + lp.player.marketValue;
    }, 0);
  }

  /**
   * Verifica si la alineación está completa
   */
  public isComplete(): boolean {
    const fieldPlayers = this.players.filter(p => !p.isBench);
    return fieldPlayers.length >= 11; // Mínimo 11 jugadores en el campo
  }

  /**
   * Obtiene estadísticas de la alineación
   */
  public getStats(): SavedLineupStats {
    const fieldPlayers = this.players.filter(p => !p.isBench);
    const benchPlayers = this.players.filter(p => p.isBench);
    const spentBudget = this.calculateSpentBudget();

    return {
      totalPlayers: this.players.length,
      fieldPlayers: fieldPlayers.length,
      benchPlayers: benchPlayers.length,
      isComplete: this.isComplete(),
      budgetUsed: spentBudget,
      budgetRemaining: this.budget - spentBudget,
      budgetPercentage: (spentBudget / this.budget) * 100,
    };
  }
}

// Interfaces de soporte
export interface SavedLineupConstructorData {
  id?: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
  formation: FormationOption;
  team: TeamSelectOption | null;
  coach: CoachSelectOption | null;
  budget: number;
  currency: CurrencyOption;
  players: LineupPlayer[];
  fieldSlots: Map<string, FieldSlot>;
  showTeamInLineup: boolean;
  showCoachInLineup: boolean;
  playersModified: PlayerDto[];
}

export interface SavedLineupMetadata {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  formation: string;
  teamName: string | null;
  coachName: string | null;
  playersCount: number;
  fieldPlayersCount: number;
  benchPlayersCount: number;
  totalBudget: number;
  spentBudget: number;
}

export interface SavedLineupStats {
  totalPlayers: number;
  fieldPlayers: number;
  benchPlayers: number;
  isComplete: boolean;
  budgetUsed: number;
  budgetRemaining: number;
  budgetPercentage: number;
}