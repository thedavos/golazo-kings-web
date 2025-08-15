import type { PlayerDto } from 'src/modules/players/dtos/player.dto';
import type { SearchResult } from './types';

export class PlayerSearchEngine {
  private readonly players: PlayerDto[];
  private searchIndex: Map<string, Set<number>>;

  constructor(players: PlayerDto[]) {
    this.players = players;
    this.searchIndex = new Map();
    this.buildSearchIndex();
  }

  /**
   * Construye un índice invertido para búsquedas rápidas
   * Complejidad: O(n * m) donde n = número de jugadores, m = número promedio de tokens por jugador
   */
  private buildSearchIndex(): void {
    this.players.forEach((player, index) => {
      const searchableFields = [
        player.firstName,
        player.lastName,
        player.nickname,
        player.position,
        player.positionAbbreviation,
        player.team,
        `${player.firstName} ${player.lastName}`.trim(),
      ];

      searchableFields.forEach((field) => {
        if (field) {
          const tokens = this.tokenize(field);
          tokens.forEach((token) => {
            if (!this.searchIndex.has(token)) {
              this.searchIndex.set(token, new Set());
            }
            this.searchIndex.get(token)!.add(index);
          });
        }
      });
    });
  }

  /**
   * Tokeniza y normaliza el texto para búsqueda
   * Maneja acentos, case-insensitive y elimina caracteres especiales
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
      .replace(/[^\w\s]/g, ' ') // Reemplaza caracteres especiales con espacios
      .split(/\s+/)
      .filter((token) => token.length > 0);
  }

  /**
   * Calcula la distancia de Levenshtein para similitud de strings
   * Usado para manejar typos y variaciones menores
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix = Array(b.length + 1)
      .fill(null)
      .map(() => Array(a.length + 1).fill(null)) as number[][];

    for (let i = 0; i <= a.length; i += 1) {
      matrix[0]![i] = i;
    }

    for (let j = 0; j <= b.length; j += 1) {
      matrix[j]![0] = j;
    }

    for (let j = 1; j <= b.length; j += 1) {
      for (let i = 1; i <= a.length; i += 1) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j]![i] = Math.min(
          matrix[j]![i - 1]! + 1, // deletion
          matrix[j - 1]![i]! + 1, // insertion
          matrix[j - 1]![i - 1]! + indicator, // substitution
        );
      }
    }

    return matrix[b.length]![a.length]!;
  }

  /**
   * Calcula el score de similitud entre dos strings
   * Retorna un valor entre 0 y 1, donde 1 es coincidencia exacta
   */
  private calculateSimilarity(query: string, target: string): number {
    if (query === target) return 1.0;

    const distance = this.levenshteinDistance(query, target);
    const maxLength = Math.max(query.length, target.length);

    if (maxLength === 0) return 1.0;

    return 1 - distance / maxLength;
  }

  /**
   * Busca jugadores usando coincidencias exactas del índice
   * Complejidad: O(1) para búsqueda en el índice + O(k) para procesar resultados
   */
  private exactSearch(queryTokens: string[]): Set<number> {
    const candidates = new Set<number>();
    let isFirstToken = true;

    for (const token of queryTokens) {
      const matchingIndices = this.searchIndex.get(token);

      if (!matchingIndices || matchingIndices.size === 0) {
        // Si no hay coincidencias para algún token, no hay resultados exactos
        return new Set();
      }

      if (isFirstToken) {
        matchingIndices.forEach((idx) => candidates.add(idx));
        isFirstToken = false;
      } else {
        // Intersección: solo mantener jugadores que coinciden con todos los tokens
        const intersection = new Set<number>();
        candidates.forEach((idx) => {
          if (matchingIndices.has(idx)) {
            intersection.add(idx);
          }
        });
        candidates.clear();
        intersection.forEach((idx) => candidates.add(idx));
      }
    }

    return candidates;
  }

  /**
   * Busca jugadores usando similitud fuzzy
   * Complejidad: O(n * m) donde n = número de jugadores, m = número de campos por jugador
   */
  private fuzzySearch(query: string, threshold: number = 0.6): SearchResult[] {
    const results: SearchResult[] = [];
    const normalizedQuery = query
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    this.players.forEach((player) => {
      const searchableFields = [
        { value: player.firstName, weight: 1.0, field: 'firstName' },
        { value: player.lastName, weight: 1.0, field: 'lastName' },
        { value: player.nickname, weight: 0.8, field: 'nickname' },
        { value: `${player.firstName} ${player.lastName}`.trim(), weight: 1.2, field: 'fullName' },
        { value: player.position, weight: 0.9, field: 'position' },
        { value: player.positionAbbreviation, weight: 0.7, field: 'positionAbbreviation' },
        { value: player.team, weight: 1.1, field: 'team' },
      ];

      let bestScore = 0;
      const matchedFields: string[] = [];

      searchableFields.forEach(({ value, weight, field }) => {
        if (value) {
          const normalizedValue = value
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
          const similarity = this.calculateSimilarity(normalizedQuery, normalizedValue);
          const weightedScore = similarity * weight;

          if (weightedScore > threshold) {
            matchedFields.push(field);
          }

          bestScore = Math.max(bestScore, weightedScore);
        }
      });

      if (bestScore > threshold && matchedFields.length > 0) {
        results.push({
          player,
          score: bestScore,
          matchedFields,
        });
      }
    });

    return results;
  }

  /**
   * Función principal de búsqueda
   * Combina búsqueda exacta e inexacta para obtener los mejores resultados
   * Complejidad total: O(k + n * m) donde k = resultados exactos, n = jugadores, m = campos
   */
  public search(query: string): PlayerDto[] {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const trimmedQuery = query.trim();
    const queryTokens = this.tokenize(trimmedQuery);

    if (queryTokens.length === 0) {
      return [];
    }

    // Paso 1: Búsqueda exacta usando el índice
    const exactMatches = this.exactSearch(queryTokens);
    const exactResults = Array.from(exactMatches).map((index) => ({
      player: this.players[index],
      score: 1.0,
      matchedFields: ['exact'],
    })) as SearchResult[];

    // Paso 2: Búsqueda fuzzy solo si no hay coincidencias exactas suficientes
    let fuzzyResults: SearchResult[] = [];
    if (exactResults.length < 5) {
      // Umbral configurable
      fuzzyResults = this.fuzzySearch(trimmedQuery, 0.6);

      // Filtrar resultados fuzzy que ya están en exactos
      const exactPlayerIds = new Set(exactResults.map((r) => r.player.id));
      fuzzyResults = fuzzyResults.filter((r) => !exactPlayerIds.has(r.player.id));
    }

    // Paso 3: Combinar y ordenar resultados
    const allResults = [...exactResults, ...fuzzyResults];

    // Ordenar por score descendente, luego por criterios adicionales
    allResults.sort((a, b) => {
      // Priorizar score más alto
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      // En caso de empate, priorizar jugadores activos
      if (a.player.isActive !== b.player.isActive) {
        return a.player.isActive ? -1 : 1;
      }

      // Finalmente, orden alfabético por nombre completo
      const nameA = `${a.player.firstName} ${a.player.lastName}`.toLowerCase();
      const nameB = `${b.player.firstName} ${b.player.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    // Retornar solo los jugadores, limitando resultados para performance
    return allResults.slice(0, 20).map((result) => result.player);
  }

  /**
   * Búsqueda avanzada con filtros adicionales
   */
  public advancedSearch(
    query: string,
    filters: {
      position?: string;
      team?: string;
      isActive?: boolean;
      minScore?: number;
    } = {},
  ): PlayerDto[] {
    const baseResults = this.search(query);

    return baseResults.filter((player) => {
      if (
        filters.position &&
        !player.position?.toLowerCase().includes(filters.position.toLowerCase())
      ) {
        return false;
      }

      if (filters.team && !player.team?.toLowerCase().includes(filters.team.toLowerCase())) {
        return false;
      }

      return !(filters.isActive !== undefined && player.isActive !== filters.isActive);
    });
  }

  /**
   * Obtiene sugerencias de búsqueda basadas en términos parciales
   */
  public getSuggestions(partialQuery: string, limit: number = 5): string[] {
    if (!partialQuery || partialQuery.length < 2) {
      return [];
    }

    const suggestions = new Set<string>();
    const normalizedPartial = partialQuery
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    // Buscar en el índice términos que comiencen con la consulta parcial
    this.searchIndex.forEach((playerIndices, term) => {
      if (term.startsWith(normalizedPartial) && suggestions.size < limit) {
        suggestions.add(term);
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }
}
