import type { PlayerDto } from 'src/modules/players/dtos/player.dto';
import type { SearchResult } from './types';

class StringNormalizationCache {
  private cache = new Map<string, string>();
  private readonly maxSize = 10000;

  normalize(text: string): string {
    if (this.cache.has(text)) {
      return this.cache.get(text)!;
    }

    const normalized = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (this.cache.size >= this.maxSize) {
      // LRU simple: limpiar cache cuando está lleno
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(text, normalized);
    return normalized;
  }

  clear(): void {
    this.cache.clear();
  }
}

// Trie para autocompletado eficiente
class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord = false;
  playerIndices: Set<number> = new Set();
}

class Trie {
  private root = new TrieNode();

  insert(word: string, playerIndex: number): void {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char)!;
      node.playerIndices.add(playerIndex);
    }
    node.isEndOfWord = true;
  }

  searchPrefix(prefix: string): Set<number> {
    let node = this.root;
    for (const char of prefix) {
      if (!node.children.has(char)) {
        return new Set();
      }
      node = node.children.get(char)!;
    }
    return node.playerIndices;
  }

  getSuggestions(prefix: string, limit: number = 5): string[] {
    const suggestions: string[] = [];
    let node = this.root;

    // Navegar hasta el prefijo
    for (const char of prefix) {
      if (!node.children.has(char)) {
        return [];
      }
      node = node.children.get(char)!;
    }

    // DFS para encontrar todas las palabras con este prefijo
    const dfs = (currentNode: TrieNode, currentWord: string): void => {
      if (suggestions.length >= limit) return;

      if (currentNode.isEndOfWord) {
        suggestions.push(prefix + currentWord);
      }

      for (const [char, childNode] of currentNode.children) {
        dfs(childNode, currentWord + char);
      }
    };

    dfs(node, '');
    return suggestions;
  }
}

// Pool de objetos para reducir garbage collection
class SearchResultPool {
  private pool: SearchResult[] = [];
  private readonly maxPoolSize = 100;

  acquire(player: PlayerDto, score: number, matchedFields: string[]): SearchResult {
    const result = this.pool.pop() || { player: null!, score: 0, matchedFields: [] };
    result.player = player;
    result.score = score;
    result.matchedFields = matchedFields;
    return result;
  }

  release(result: SearchResult): void {
    if (this.pool.length < this.maxPoolSize) {
      result.matchedFields = [];
      this.pool.push(result);
    }
  }

  releaseAll(results: SearchResult[]): void {
    results.forEach((r) => this.release(r));
  }
}

export class PlayerSearchEngine {
  private readonly players: PlayerDto[];
  private searchIndex: Map<string, Set<number>>;
  private trie: Trie;
  private normalizationCache: StringNormalizationCache;
  private resultPool: SearchResultPool;

  // Índices adicionales para búsquedas frecuentes
  private positionIndex: Map<string, Set<number>>;
  private teamIndex: Map<string, Set<number>>;
  private activePlayersIndex: Set<number>;

  // Cache de búsquedas recientes (LRU)
  private searchCache: Map<string, PlayerDto[]>;
  private readonly maxCacheSize = 100;

  // Pre-computados para evitar cálculos repetitivos
  private playerSearchableText: Map<number, string>;
  private levenshteinCache: Map<string, number>;

  constructor(players: PlayerDto[]) {
    this.players = players;
    this.searchIndex = new Map();
    this.trie = new Trie();
    this.normalizationCache = new StringNormalizationCache();
    this.resultPool = new SearchResultPool();
    this.positionIndex = new Map();
    this.teamIndex = new Map();
    this.activePlayersIndex = new Set();
    this.searchCache = new Map();
    this.playerSearchableText = new Map();
    this.levenshteinCache = new Map();

    this.buildAllIndices();
  }

  /**
   * Construye todos los índices de manera optimizada
   * Complejidad: O(n * m) pero con múltiples optimizaciones de cache
   */
  private buildAllIndices(): void {
    this.players.forEach((player, index) => {
      // Pre-computar texto buscable normalizado
      const fullName = `${player.firstName} ${player.lastName}`.trim();
      const searchableText = this.normalizationCache.normalize(
        [fullName, player.nickname, player.position, player.team].filter(Boolean).join(' '),
      );
      this.playerSearchableText.set(index, searchableText);

      // Índice principal con n-gramas para búsqueda parcial
      const searchableFields = [
        player.firstName,
        player.lastName,
        player.nickname,
        player.position,
        player.team,
        fullName,
      ].filter(Boolean);

      searchableFields.forEach((field) => {
        const normalized = this.normalizationCache.normalize(field!);

        // Tokenización estándar
        const tokens = this.tokenize(normalized);
        tokens.forEach((token) => {
          if (!this.searchIndex.has(token)) {
            this.searchIndex.set(token, new Set());
          }
          this.searchIndex.get(token)!.add(index);

          // Agregar al Trie para autocompletado
          this.trie.insert(token, index);
        });

        // N-gramas para búsqueda parcial (solo para campos principales)
        if (field === player.firstName || field === player.lastName) {
          this.addNGrams(normalized, index, 2, 3);
        }
      });

      // Índices secundarios
      if (player.position) {
        const normalizedPosition = this.normalizationCache.normalize(player.position);
        if (!this.positionIndex.has(normalizedPosition)) {
          this.positionIndex.set(normalizedPosition, new Set());
        }
        this.positionIndex.get(normalizedPosition)!.add(index);
      }

      if (player.team) {
        const normalizedTeam = this.normalizationCache.normalize(player.team);
        if (!this.teamIndex.has(normalizedTeam)) {
          this.teamIndex.set(normalizedTeam, new Set());
        }
        this.teamIndex.get(normalizedTeam)!.add(index);
      }

      if (player.isActive) {
        this.activePlayersIndex.add(index);
      }
    });
  }

  /**
   * Agrega n-gramas al índice para búsqueda parcial eficiente
   */
  private addNGrams(text: string, playerIndex: number, minN: number, maxN: number): void {
    for (let n = minN; n <= maxN && n <= text.length; n++) {
      for (let i = 0; i <= text.length - n; i++) {
        const ngram = text.substring(i, i + n);
        if (!this.searchIndex.has(ngram)) {
          this.searchIndex.set(ngram, new Set());
        }
        this.searchIndex.get(ngram)!.add(playerIndex);
      }
    }
  }

  /**
   * Tokenización optimizada con cache
   */
  private tokenize(text: string): string[] {
    return text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 0);
  }

  /**
   * Distancia de Levenshtein optimizada con programación dinámica y cache
   */
  private levenshteinDistance(a: string, b: string): number {
    // Cache key para pares de strings
    const cacheKey = `${a}|${b}`;
    if (this.levenshteinCache.has(cacheKey)) {
      return this.levenshteinCache.get(cacheKey)!;
    }

    // Early termination si la diferencia de longitud es muy grande
    if (Math.abs(a.length - b.length) > 5) {
      return Math.abs(a.length - b.length);
    }

    // Optimización: usar array unidimensional en lugar de matriz
    const len1 = a.length;
    const len2 = b.length;
    let prevRow = Array(len2 + 1).fill(0);
    let currRow = Array(len2 + 1).fill(0);

    // Inicializar primera fila
    for (let j = 0; j <= len2; j++) {
      prevRow[j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      currRow[0] = i;

      for (let j = 1; j <= len2; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        currRow[j] = Math.min(
          currRow[j - 1] + 1, // inserción
          prevRow[j] + 1, // eliminación
          prevRow[j - 1] + cost, // sustitución
        );
      }

      // Swap rows
      [prevRow, currRow] = [currRow, prevRow];
    }

    const distance = prevRow[len2];

    // Limitar tamaño del cache
    if (this.levenshteinCache.size > 1000) {
      // Limpiar cache cuando sea muy grande
      const firstKey = this.levenshteinCache.keys().next().value;
      this.levenshteinCache.delete(firstKey);
    }

    this.levenshteinCache.set(cacheKey, distance);
    return distance;
  }

  /**
   * Calcula similitud con múltiples métricas
   */
  private calculateSimilarity(query: string, target: string): number {
    if (query === target) return 1.0;

    // Similitud de Jaccard para conjuntos de caracteres
    const set1 = new Set(query);
    const set2 = new Set(target);
    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    const jaccardSimilarity = intersection.size / union.size;

    // Similitud basada en Levenshtein
    const distance = this.levenshteinDistance(query, target);
    const maxLength = Math.max(query.length, target.length);
    const levenshteinSimilarity = maxLength === 0 ? 1.0 : 1 - distance / maxLength;

    // Similitud de prefijo (boost si el target empieza con query)
    const prefixBoost = target.startsWith(query) ? 0.2 : 0;

    // Combinar métricas con pesos
    return levenshteinSimilarity * 0.6 + jaccardSimilarity * 0.4 + prefixBoost;
  }

  /**
   * Búsqueda exacta optimizada con intersección eficiente
   */
  private exactSearch(queryTokens: string[]): Set<number> {
    if (queryTokens.length === 0) return new Set();

    // Ordenar tokens por frecuencia (los menos frecuentes primero)
    const tokensByFrequency = queryTokens
      .map((token) => ({
        token,
        count: this.searchIndex.get(token)?.size || 0,
      }))
      .filter((t) => t.count > 0)
      .sort((a, b) => a.count - b.count);

    if (tokensByFrequency.length === 0) return new Set();

    // Empezar con el conjunto más pequeño
    let result = new Set(this.searchIndex.get(tokensByFrequency[0]!.token));

    // Intersección con los demás conjuntos
    for (let i = 1; i < tokensByFrequency.length && result.size > 0; i++) {
      const currentSet = this.searchIndex.get(tokensByFrequency[i]!.token)!;
      result = new Set([...result].filter((x) => currentSet.has(x)));
    }

    return result;
  }

  /**
   * Búsqueda fuzzy optimizada con scoring mejorado
   */
  private fuzzySearch(query: string, threshold: number = 0.5): SearchResult[] {
    const results: SearchResult[] = [];
    const normalizedQuery = this.normalizationCache.normalize(query);
    const queryTokens = new Set(this.tokenize(normalizedQuery));

    // Usar índice para pre-filtrar candidatos
    const candidates = new Set<number>();
    for (const token of queryTokens) {
      // Buscar tokens similares en el índice
      for (const [indexToken, playerIndices] of this.searchIndex) {
        if (this.calculateSimilarity(token, indexToken) > 0.7) {
          playerIndices.forEach((idx) => candidates.add(idx));
        }
      }
    }

    // Evaluar solo candidatos pre-filtrados
    candidates.forEach((index) => {
      const player = this.players[index] as PlayerDto;
      const searchableText = this.playerSearchableText.get(index)!;

      // Calcular score usando múltiples factores
      const textSimilarity = this.calculateSimilarity(normalizedQuery, searchableText);

      // Boost por coincidencia de tokens
      const playerTokens = new Set(this.tokenize(searchableText));
      const tokenOverlap = [...queryTokens].filter((t) => playerTokens.has(t)).length;
      const tokenBoost = (tokenOverlap / queryTokens.size) * 0.3;

      // Boost por jugador activo
      const activeBoost = player.isActive ? 0.1 : 0;

      const finalScore = textSimilarity + tokenBoost + activeBoost;

      if (finalScore > threshold) {
        results.push(this.resultPool.acquire(player, finalScore, ['fuzzy']));
      }
    });

    return results;
  }

  /**
   * Búsqueda principal con cache y optimizaciones
   */
  public search(query: string): PlayerDto[] {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const trimmedQuery = query.trim();

    // Verificar cache
    if (this.searchCache.has(trimmedQuery)) {
      return this.searchCache.get(trimmedQuery)!;
    }

    const normalizedQuery = this.normalizationCache.normalize(trimmedQuery);
    const queryTokens = this.tokenize(normalizedQuery);

    if (queryTokens.length === 0) {
      return [];
    }

    // Búsqueda exacta
    const exactMatches = this.exactSearch(queryTokens);
    const exactResults = Array.from(exactMatches).map((index) =>
      this.resultPool.acquire(this.players[index]!, 1.0, ['exact']),
    );

    // Búsqueda fuzzy si es necesario
    let fuzzyResults: SearchResult[] = [];
    if (exactResults.length < 10) {
      fuzzyResults = this.fuzzySearch(trimmedQuery, 0.4);

      // Filtrar duplicados
      const exactPlayerIds = new Set(exactResults.map((r) => r.player.id));
      fuzzyResults = fuzzyResults.filter((r) => !exactPlayerIds.has(r.player.id));
    }

    // Combinar y ordenar
    const allResults = [...exactResults, ...fuzzyResults];

    allResults.sort((a, b) => {
      if (Math.abs(b.score - a.score) > 0.01) {
        return b.score - a.score;
      }

      // Priorizar jugadores activos
      if (a.player.isActive !== b.player.isActive) {
        return a.player.isActive ? -1 : 1;
      }

      // Orden alfabético
      const nameA = `${a.player.firstName} ${a.player.lastName}`.toLowerCase();
      const nameB = `${b.player.firstName} ${b.player.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    const finalResults = allResults.slice(0, 20).map((r) => r.player);

    // Actualizar cache (LRU)
    if (this.searchCache.size >= this.maxCacheSize) {
      const firstKey = this.searchCache.keys().next().value;
      this.searchCache.delete(firstKey);
    }
    this.searchCache.set(trimmedQuery, finalResults);

    // Liberar objetos al pool
    this.resultPool.releaseAll(allResults);

    return finalResults;
  }

  /**
   * Búsqueda avanzada optimizada con índices específicos
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
    // Comenzar con conjunto de todos los jugadores o filtrados
    let candidateIndices: Set<number>;

    if (filters.position || filters.team || filters.isActive !== undefined) {
      // Usar índices específicos para filtrado inicial
      const sets: Set<number>[] = [];

      if (filters.position) {
        const normalizedPosition = this.normalizationCache.normalize(filters.position);
        const positionSet = this.positionIndex.get(normalizedPosition);
        if (positionSet) sets.push(positionSet);
      }

      if (filters.team) {
        const normalizedTeam = this.normalizationCache.normalize(filters.team);
        const teamSet = this.teamIndex.get(normalizedTeam);
        if (teamSet) sets.push(teamSet);
      }

      if (filters.isActive === true) {
        sets.push(this.activePlayersIndex);
      } else if (filters.isActive === false) {
        const inactiveSet = new Set(
          this.players.map((_, idx) => idx).filter((idx) => !this.activePlayersIndex.has(idx)),
        );
        sets.push(inactiveSet);
      }

      // Intersección de todos los conjuntos
      if (sets.length > 0) {
        candidateIndices = sets.reduce((acc, set) => new Set([...acc].filter((x) => set.has(x))));
      } else {
        candidateIndices = new Set(this.players.map((_, idx) => idx));
      }
    } else {
      candidateIndices = new Set(this.players.map((_, idx) => idx));
    }

    // Filtrar players basado en índices candidatos
    const filteredPlayers = Array.from(candidateIndices).map(
      (idx) => this.players[idx],
    ) as PlayerDto[];

    // Crear un mini-engine temporal con jugadores filtrados
    if (query && filteredPlayers.length > 0) {
      const tempEngine = new PlayerSearchEngine(filteredPlayers);
      return tempEngine.search(query);
    }

    return filteredPlayers.slice(0, 20);
  }

  /**
   * Autocompletado optimizado con Trie
   */
  public getSuggestions(partialQuery: string, limit: number = 5): string[] {
    if (!partialQuery || partialQuery.length < 2) {
      return [];
    }

    const normalizedPartial = this.normalizationCache.normalize(partialQuery);
    return this.trie.getSuggestions(normalizedPartial, limit);
  }

  /**
   * Limpia caches para liberar memoria
   */
  public clearCaches(): void {
    this.searchCache.clear();
    this.levenshteinCache.clear();
    this.normalizationCache.clear();
  }

  /**
   * Obtiene estadísticas del motor de búsqueda
   */
  public getStats(): {
    totalPlayers: number;
    indexSize: number;
    cacheSize: number;
    activePlayers: number;
  } {
    return {
      totalPlayers: this.players.length,
      indexSize: this.searchIndex.size,
      cacheSize: this.searchCache.size,
      activePlayers: this.activePlayersIndex.size,
    };
  }
}
