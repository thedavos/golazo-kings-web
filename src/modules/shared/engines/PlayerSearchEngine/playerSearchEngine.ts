import type { PlayerDto } from 'src/modules/players/dtos/player.dto';
import type { SearchResult } from './types';
import type { Filter } from 'src/modules/lineup-builder/types';
import type { OrderBySelectOption } from 'src/modules/lineup-builder/constants/orderBy.constant';

// LRU Cache genérico con implementación real
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private readonly maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }

    // Mover al final (más reciente) para implementar LRU real
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    // Si ya existe, eliminarlo para re-agregarlo al final
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Si el cache está lleno, eliminar el menos usado (primero)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    // Agregar al final (más reciente)
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

// Algoritmo Soundex adaptado para español
// Permite encontrar nombres aunque estén mal escritos ("Gonsalez" = "González")
class SpanishSoundex {
  private static readonly replacements: [RegExp, string][] = [
    [/[aeiouáéíóúü]/gi, '0'],
    [/[bp]/gi, '1'],
    [/[fv]/gi, '2'],
    [/[cgjkqsxz]/gi, '3'],
    [/[dt]/gi, '4'],
    [/[l]/gi, '5'],
    [/[mnñ]/gi, '6'],
    [/[r]/gi, '7'],
  ];

  static encode(text: string): string {
    if (!text || text.length === 0) return '';

    // Normalizar y convertir a minúsculas
    let code = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    // Guardar primera letra
    const firstLetter = code[0];

    // Aplicar reemplazos
    for (const [pattern, replacement] of this.replacements) {
      code = code.replace(pattern, replacement);
    }

    // Eliminar dígitos duplicados consecutivos
    code = code.replace(/(\d)\1+/g, '$1');

    // Eliminar ceros
    code = code.replace(/0/g, '');

    // Restaurar primera letra y tomar primeros 4 caracteres
    code = firstLetter + code.substring(1);
    return code.substring(0, 4).padEnd(4, '0');
  }
}

class StringNormalizationCache {
  private cache = new Map<string, string>();
  private readonly maxSize = 2000; // Optimizado para ~5000 items

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

export class PlayerSearchEngine {
  private readonly players: PlayerDto[];
  private searchIndex: Map<string, Set<number>>;
  private trie: Trie;
  private normalizationCache: StringNormalizationCache;

  // Índices adicionales para búsquedas frecuentes
  private positionIndex: Map<string, Set<number>>;
  private teamIndex: Map<string, Set<number>>;
  private leagueIndex: Map<string, Set<number>>;
  private queensLeagueIndex: Set<number>;
  private kingsLeagueIndex: Set<number>;
  private activePlayersIndex: Set<number>;
  private aliasIndex: Map<string, number>; // Mapa de alias/apodos → índice de jugador
  private soundexIndex: Map<string, Set<number>>; // Índice fonético para búsqueda tolerante a errores
  private prefixIndex: Map<string, Set<number>>; // Índice de prefijos para búsqueda rápida

  // Cache de búsquedas recientes (LRU real)
  private searchCache: LRUCache<string, PlayerDto[]>;

  // Pre-computados para evitar cálculos repetitivos
  private playerSearchableText: Map<number, string>;
  private levenshteinCache: Map<string, number>;

  constructor(players: PlayerDto[]) {
    this.players = players;
    this.searchIndex = new Map();
    this.trie = new Trie();
    this.normalizationCache = new StringNormalizationCache();
    this.positionIndex = new Map();
    this.teamIndex = new Map();
    this.leagueIndex = new Map();
    this.activePlayersIndex = new Set();
    this.queensLeagueIndex = new Set();
    this.kingsLeagueIndex = new Set();
    this.aliasIndex = new Map();
    this.soundexIndex = new Map();
    this.prefixIndex = new Map();
    this.searchCache = new LRUCache(50); // LRU real optimizado para 5000 items
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
          this.addNGrams(normalized, index, 2, 4); // 2, 3 y 4-gramas para mejor cobertura
        }

        // Prefijos para búsqueda rápida de autocompletado
        if (field === player.firstName || field === player.lastName) {
          this.addPrefixes(normalized, index, 3); // Prefijos desde 3 caracteres
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

      if (player.leagueId) {
        const normalizedLeagueId = this.normalizationCache.normalize(String(player.leagueId));
        if (!this.leagueIndex.has(normalizedLeagueId)) {
          this.leagueIndex.set(normalizedLeagueId, new Set());
        }
        this.leagueIndex.get(normalizedLeagueId)!.add(index);
      }

      if (player.isActive) {
        this.activePlayersIndex.add(index);
      }

      if (player.isQueensLeaguePlayer) {
        this.queensLeagueIndex.add(index);
      } else {
        this.kingsLeagueIndex.add(index);
      }

      // Índice de alias/apodos para coincidencias exactas
      if (player.nickname) {
        const normalizedNickname = this.normalizationCache.normalize(player.nickname);
        this.aliasIndex.set(normalizedNickname, index);

        // También agregar variaciones comunes (primera palabra del apodo)
        const firstWord = normalizedNickname.split(' ')[0];
        if (firstWord && firstWord.length > 2) {
          this.aliasIndex.set(firstWord, index);
        }
      }

      // Índice fonético (Soundex) para nombres y apellidos
      [player.firstName, player.lastName].forEach((name) => {
        if (name && name.length > 2) {
          const soundexCode = SpanishSoundex.encode(name);
          if (!this.soundexIndex.has(soundexCode)) {
            this.soundexIndex.set(soundexCode, new Set());
          }
          this.soundexIndex.get(soundexCode)!.add(index);
        }
      });
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
   * Agrega prefijos al índice para búsqueda rápida de autocompletado
   * Genera todos los prefijos desde minLength hasta la longitud completa
   */
  private addPrefixes(text: string, playerIndex: number, minLength: number = 3): void {
    // Solo agregar prefijos si el texto es suficientemente largo
    if (text.length < minLength) return;

    for (let i = minLength; i <= text.length; i++) {
      const prefix = text.substring(0, i);
      if (!this.prefixIndex.has(prefix)) {
        this.prefixIndex.set(prefix, new Set());
      }
      this.prefixIndex.get(prefix)!.add(playerIndex);
    }
  }

  /**
   * Busca jugadores por prefijo exacto
   */
  private searchByPrefix(query: string): Set<number> {
    return this.prefixIndex.get(query) || new Set();
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
   * Normaliza y tokeniza un query en un solo paso
   */
  private normalizeAndTokenize(query: string): { normalized: string; tokens: string[] } {
    const normalized = this.normalizationCache.normalize(query);
    const tokens = this.tokenize(normalized);
    return { normalized, tokens };
  }

  /**
   * Calcula el score de un jugador basado en múltiples factores
   */
  private calculatePlayerScore(
    normalizedQuery: string,
    queryTokens: Set<string>,
    player: PlayerDto,
    searchableText: string,
    tokenBoostWeight: number = 0.5,
  ): number {
    // Calcular similitud usando texto pre-computado
    const textSimilarity = this.calculateSimilarity(normalizedQuery, searchableText);

    // Boost por coincidencia de tokens
    const playerTokens = new Set(this.tokenize(searchableText));
    const tokenOverlap = [...queryTokens].filter((t) => playerTokens.has(t)).length;
    const tokenBoost =
      queryTokens.size > 0 ? (tokenOverlap / queryTokens.size) * tokenBoostWeight : 0;

    // Boost por jugador activo
    const activeBoost = player.isActive ? 0.1 : 0;

    return textSimilarity + tokenBoost + activeBoost;
  }

  /**
   * Ordena resultados de búsqueda por score y criterios secundarios
   */
  private sortSearchResults(results: SearchResult[]): SearchResult[] {
    return results.sort((a, b) => {
      // Ordenar por score primero
      if (Math.abs(b.score - a.score) > 0.01) {
        return b.score - a.score;
      }

      // Priorizar jugadores activos
      if (a.player.isActive !== b.player.isActive) {
        return a.player.isActive ? -1 : 1;
      }

      // Orden alfabético como fallback
      const nameA = `${a.player.firstName} ${a.player.lastName}`.toLowerCase();
      const nameB = `${b.player.firstName} ${b.player.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }

  /**
   * Filtra duplicados de un array de resultados
   */
  private filterDuplicates(results: SearchResult[], existingIds: Set<number>): SearchResult[] {
    return results.filter((r) => !existingIds.has(r.player.id));
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
    if (this.levenshteinCache.size > 300) {
      // Limpiar cache cuando sea muy grande (optimizado para ~5000 items)
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
   * Ordena una lista de jugadores según la configuración de ordenamiento
   * Maneja correctamente valores null/undefined (siempre al final)
   */
  private sortPlayers(players: PlayerDto[], sortBy?: OrderBySelectOption): PlayerDto[] {
    if (!sortBy) return players;

    const sorted = [...players];

    sorted.sort((a, b) => {
      let valueA: string | number | null | undefined;
      let valueB: string | number | null | undefined;

      // Obtener valores según el campo
      switch (sortBy.field) {
        case 'name':
          valueA = `${a.firstName} ${a.lastName}`.toLowerCase();
          valueB = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'marketValue':
          valueA = a.marketValue;
          valueB = b.marketValue;
          break;
        case 'rating':
          valueA = a.rating;
          valueB = b.rating;
          break;
        default:
          return 0;
      }

      // Manejar null/undefined: siempre al final
      const isANullish = valueA === null || valueA === undefined;
      const isBNullish = valueB === null || valueB === undefined;

      if (isANullish && isBNullish) return 0;
      if (isANullish) return 1; // A al final
      if (isBNullish) return -1; // B al final

      // Comparar valores válidos
      let comparison = 0;
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        comparison = valueA.localeCompare(valueB);
      } else if (typeof valueA === 'number' && typeof valueB === 'number') {
        comparison = valueA - valueB;
      }

      // Aplicar dirección de ordenamiento
      return sortBy.direction === 'desc' ? -comparison : comparison;
    });

    return sorted;
  }

  /**
   * Búsqueda directa en candidatos filtrados (sin reconstruir índices)
   * Mucho más eficiente que crear un engine temporal
   */
  private searchInCandidates(
    query: string,
    candidateIndices: Set<number>,
    sortBy?: OrderBySelectOption,
  ): PlayerDto[] {
    const { normalized, tokens } = this.normalizeAndTokenize(query);
    const queryTokens = new Set(tokens);
    const results: SearchResult[] = [];

    // Buscar solo en los candidatos pre-filtrados
    candidateIndices.forEach((index) => {
      const player = this.players[index] as PlayerDto;
      const searchableText = this.playerSearchableText.get(index)!;

      const finalScore = this.calculatePlayerScore(
        normalized,
        queryTokens,
        player,
        searchableText,
        0.5,
      );

      if (finalScore > 0.3) {
        results.push({ player, score: finalScore, matchedFields: ['filtered'] });
      }
    });

    // Ordenar resultados
    this.sortSearchResults(results);

    const topResults = results.slice(0, 20).map((r) => r.player);

    // Aplicar ordenamiento personalizado si se especifica
    return sortBy ? this.sortPlayers(topResults, sortBy) : topResults;
  }

  /**
   * Búsqueda fonética usando Soundex
   * Encuentra jugadores aunque el nombre esté mal escrito
   */
  private phoneticSearch(query: string): SearchResult[] {
    const results: SearchResult[] = [];
    const queryTokens = this.tokenize(query);

    // Generar códigos soundex para cada token de la consulta
    const querySoundexCodes = queryTokens
      .filter((token) => token.length > 2)
      .map((token) => SpanishSoundex.encode(token));

    const candidateIndices = new Set<number>();

    // Buscar jugadores con códigos soundex similares
    querySoundexCodes.forEach((code) => {
      const matches = this.soundexIndex.get(code);
      if (matches) {
        matches.forEach((idx) => candidateIndices.add(idx));
      }
    });

    // Crear resultados con score moderado (menor que fuzzy)
    candidateIndices.forEach((index) => {
      const player = this.players[index] as PlayerDto;
      results.push({
        player,
        score: 0.5, // Score moderado para búsqueda fonética
        matchedFields: ['phonetic'],
      });
    });

    return results;
  }

  /**
   * Búsqueda fuzzy optimizada con scoring mejorado
   */
  private fuzzySearch(query: string, threshold: number = 0.5): SearchResult[] {
    const results: SearchResult[] = [];
    const { normalized, tokens } = this.normalizeAndTokenize(query);
    const queryTokens = new Set(tokens);

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

      const finalScore = this.calculatePlayerScore(
        normalized,
        queryTokens,
        player,
        searchableText,
        0.3,
      );

      if (finalScore > threshold) {
        results.push({ player, score: finalScore, matchedFields: ['fuzzy'] });
      }
    });

    return results;
  }

  /**
   * Búsqueda principal con cache y optimizaciones
   */
  public search(query: string, sortBy?: OrderBySelectOption): PlayerDto[] {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const trimmedQuery = query.trim();

    // Verificar cache LRU (automáticamente lo mueve al final si existe)
    const cachedResult = this.searchCache.get(trimmedQuery);
    if (cachedResult) {
      return cachedResult;
    }

    const { normalized, tokens } = this.normalizeAndTokenize(trimmedQuery);

    if (tokens.length === 0) {
      return [];
    }

    // Buscar coincidencia exacta de alias/apodo primero (boost máximo)
    const aliasMatch = this.aliasIndex.get(normalized);
    const aliasResults: SearchResult[] = [];
    if (aliasMatch !== undefined) {
      aliasResults.push({
        player: this.players[aliasMatch]!,
        score: 1.2, // Score más alto que exacta para priorizar
        matchedFields: ['alias'],
      });
    }

    // Búsqueda por prefijo (nueva estrategia para queries cortas)
    const prefixResults: SearchResult[] = [];
    if (normalized.length >= 3 && normalized.length <= 8) {
      const prefixMatches = this.searchByPrefix(normalized);
      if (prefixMatches.size > 0) {
        Array.from(prefixMatches).forEach((index) => {
          prefixResults.push({
            player: this.players[index]!,
            score: 1.1, // Score alto para prefijos
            matchedFields: ['prefix'],
          });
        });
      }
    }

    // Búsqueda exacta
    const exactMatches = this.exactSearch(tokens);
    const exactResults = Array.from(exactMatches).map((index) => ({
      player: this.players[index]!,
      score: 1.0,
      matchedFields: ['exact'],
    }));

    // Filtrar duplicados de prefix en exact
    const existingIdsAfterPrefix = new Set(
      [...aliasResults, ...prefixResults].map((r) => r.player.id),
    );
    const filteredExactResults = this.filterDuplicates(exactResults, existingIdsAfterPrefix);

    // Búsqueda fuzzy si es necesario
    let fuzzyResults: SearchResult[] = [];
    if (aliasResults.length + prefixResults.length + filteredExactResults.length < 10) {
      // Threshold más bajo para queries cortas
      const threshold = normalized.length <= 4 ? 0.5 : 0.7;
      fuzzyResults = this.fuzzySearch(trimmedQuery, threshold);

      // Filtrar duplicados
      const existingIds = new Set(
        [...aliasResults, ...prefixResults, ...filteredExactResults].map((r) => r.player.id),
      );
      fuzzyResults = this.filterDuplicates(fuzzyResults, existingIds);
    }

    // Búsqueda fonética como último recurso (cuando hay pocos resultados)
    let phoneticResults: SearchResult[] = [];
    if (
      aliasResults.length + prefixResults.length + filteredExactResults.length + fuzzyResults.length <
      5
    ) {
      phoneticResults = this.phoneticSearch(trimmedQuery);

      // Filtrar duplicados
      const allExistingIds = new Set(
        [...aliasResults, ...prefixResults, ...filteredExactResults, ...fuzzyResults].map(
          (r) => r.player.id,
        ),
      );
      phoneticResults = this.filterDuplicates(phoneticResults, allExistingIds);
    }

    // Combinar y ordenar (alias > prefix > exacta > fuzzy > fonética)
    const allResults = [
      ...aliasResults,
      ...prefixResults,
      ...filteredExactResults,
      ...fuzzyResults,
      ...phoneticResults,
    ];

    this.sortSearchResults(allResults);

    let finalResults = allResults.slice(0, 20).map((r) => r.player);

    // Aplicar ordenamiento personalizado si se especifica
    if (sortBy) {
      finalResults = this.sortPlayers(finalResults, sortBy);
    }

    // Actualizar cache LRU (maneja automáticamente el límite de tamaño)
    this.searchCache.set(trimmedQuery, finalResults);

    return finalResults;
  }

  /**
   * Búsqueda avanzada optimizada con índices específicos
   */
  public advancedSearch(query: string, filters: Filter, sortBy?: OrderBySelectOption): PlayerDto[] {
    // Comenzar con conjunto de todos los jugadores o filtrados
    let candidateIndices: Set<number>;

    if (filters.position || filters.team || filters.league) {
      // Usar índices específicos para filtrado inicial
      const sets: Set<number>[] = [];

      if (filters.position) {
        const normalizedPosition = this.normalizationCache.normalize(filters.position.value);
        const positionSet = this.positionIndex.get(normalizedPosition);
        if (positionSet) sets.push(positionSet);
      }

      if (filters.team) {
        const normalizedTeam = this.normalizationCache.normalize(filters.team.label);
        const teamSet = this.teamIndex.get(normalizedTeam);
        if (teamSet) sets.push(teamSet);
      }

      if (filters.league) {
        const normalizedLeagueId = this.normalizationCache.normalize(String(filters.league.value));
        const leagueSet = this.leagueIndex.get(normalizedLeagueId);
        if (leagueSet) sets.push(leagueSet);
      }

      if (filters.league?.type === 'queens') {
        sets.push(this.queensLeagueIndex);
      }

      if (filters.league?.type === 'kings') {
        sets.push(this.kingsLeagueIndex);
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

    // Buscar directamente en candidatos filtrados (sin reconstruir índices)
    if (query && candidateIndices.size > 0) {
      return this.searchInCandidates(query, candidateIndices, sortBy);
    }

    // Sin query, devolver candidatos filtrados directamente con ordenamiento
    let filteredResults = Array.from(candidateIndices)
      .slice(0, 20)
      .map((idx) => this.players[idx]) as PlayerDto[];

    // Aplicar ordenamiento si se especifica
    if (sortBy) {
      filteredResults = this.sortPlayers(filteredResults, sortBy);
    }

    return filteredResults;
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
    prefixIndexSize: number;
    cacheSize: number;
    activePlayers: number;
  } {
    return {
      totalPlayers: this.players.length,
      indexSize: this.searchIndex.size,
      prefixIndexSize: this.prefixIndex.size,
      cacheSize: this.searchCache.size,
      activePlayers: this.activePlayersIndex.size,
    };
  }

  /**
   * Obtiene estadísticas detalladas del motor de búsqueda
   * Útil para debugging y monitoring de rendimiento
   */
  public getDetailedStats() {
    return {
      players: {
        total: this.players.length,
        active: this.activePlayersIndex.size,
        inactive: this.players.length - this.activePlayersIndex.size,
        queensLeague: this.queensLeagueIndex.size,
        kingsLeague: this.kingsLeagueIndex.size,
      },
      indices: {
        searchIndex: {
          size: this.searchIndex.size,
          tokens: this.searchIndex.size,
        },
        prefixIndex: {
          size: this.prefixIndex.size,
          description: 'Índice de prefijos para autocompletado rápido',
        },
        positions: this.positionIndex.size,
        teams: this.teamIndex.size,
        leagues: this.leagueIndex.size,
        trieNodes: this.estimateTrieSize(),
      },
      caches: {
        searches: {
          size: this.searchCache.size,
          maxSize: 50,
          hitRate: 'N/A', // Podría implementarse con contadores
        },
        levenshtein: {
          size: this.levenshteinCache.size,
          maxSize: 300,
        },
        playerSearchableText: this.playerSearchableText.size,
      },
      memory: {
        estimatedMB: this.estimateMemoryUsage(),
      },
    };
  }

  /**
   * Estima el tamaño del árbol Trie (número aproximado de nodos)
   */
  private estimateTrieSize(): string {
    // Estimación aproximada basada en el número de tokens
    return `~${this.searchIndex.size * 2} nodos`;
  }

  /**
   * Estima el uso de memoria del motor de búsqueda
   */
  private estimateMemoryUsage(): number {
    // Estimaciones aproximadas en bytes
    const searchIndexSize = this.searchIndex.size * 150; // Cada entrada ~150 bytes
    const trieSize = this.searchIndex.size * 200; // Cada nodo Trie ~200 bytes
    const playerTextSize = this.playerSearchableText.size * 100; // Cada texto ~100 bytes
    const cacheSize = this.searchCache.size * 1000; // Cada resultado ~1KB
    const levenshteinSize = this.levenshteinCache.size * 50; // Cada entrada ~50 bytes

    const totalBytes = searchIndexSize + trieSize + playerTextSize + cacheSize + levenshteinSize;
    return Math.round((totalBytes / 1024 / 1024) * 100) / 100; // MB con 2 decimales
  }
}
