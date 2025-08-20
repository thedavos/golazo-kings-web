import { computed, onUnmounted, readonly, ref, type Ref, shallowRef, watch } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import { debounce, throttle } from 'quasar';
import { PlayerSearchEngine } from 'src/modules/shared/engines/PlayerSearchEngine';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';

// Tipos para mejor type safety
interface SearchFilters {
  position?: string;
  team?: string;
  isActive?: boolean;
  minScore?: number;
}

interface SearchState {
  query: string;
  results: PlayerDto[];
  suggestions: string[];
  isLoading: boolean;
  isInitialized: boolean;
  showSuggestions: boolean;
  error: Error | null;
  lastSearchTime: number;
  totalSearches: number;
}

interface SearchHistory {
  query: string;
  timestamp: number;
  resultCount: number;
}

export function usePlayerSearch(
  options: {
    debounceTime?: number;
    maxResults?: number;
    maxSuggestions?: number;
    enableWebWorker?: boolean;
    enableAnalytics?: boolean;
    cacheStrategy?: 'memory' | 'sessionStorage' | 'localStorage';
    filters?: Ref<SearchFilters>;
  } = {},
) {
  const {
    debounceTime = 300,
    maxResults = 20,
    maxSuggestions = 5,
    // enableAnalytics = false,
    cacheStrategy = 'memory',
    filters = ref({}),
  } = options;

  // Estado principal usando shallowRef para mejor performance con arrays grandes
  const state = ref<SearchState>({
    query: '',
    results: [],
    suggestions: [],
    isLoading: false,
    isInitialized: false,
    showSuggestions: false,
    error: null,
    lastSearchTime: 0,
    totalSearches: 0,
  });

  // Referencias shallow para datos grandes
  const allPlayers = shallowRef<PlayerDto[]>([]);
  const searchHistory = ref<SearchHistory[]>([]);
  const recentSearches = ref<Set<string>>(new Set());

  // Engine y worker
  let searchEngine: PlayerSearchEngine | null = null;
  let searchAbortController: AbortController | null = null;

  // Cache estratégico con TTL
  class SearchCache {
    private cache: Map<string, { results: PlayerDto[]; timestamp: number }> = new Map();
    private readonly maxSize = 100;
    private readonly ttl = 5 * 60 * 1000; // 5 minutos

    set(key: string, results: PlayerDto[]): void {
      if (this.cache.size >= this.maxSize) {
        const cacheEntries = [...this.cache.entries()];

        const oldestKey = cacheEntries.sort((a, b) => a[1].timestamp - b[1].timestamp)[0]![0];
        this.cache.delete(oldestKey);
      }

      this.cache.set(key, { results, timestamp: Date.now() });

      // Persistir en storage si está configurado
      if (cacheStrategy !== 'memory') {
        this.persistToStorage(key, results);
      }
    }

    get(key: string): PlayerDto[] | null {
      const entry = this.cache.get(key);
      if (!entry) {
        // Intentar recuperar de storage
        return this.retrieveFromStorage(key);
      }

      // Verificar TTL
      if (Date.now() - entry.timestamp > this.ttl) {
        this.cache.delete(key);
        return null;
      }

      // Actualizar timestamp (LRU)
      entry.timestamp = Date.now();
      return entry.results;
    }

    private persistToStorage(key: string, results: PlayerDto[]): void {
      try {
        const storage = cacheStrategy === 'sessionStorage' ? sessionStorage : localStorage;
        const cacheKey = `playerSearch_${key}`;
        storage.setItem(
          cacheKey,
          JSON.stringify({
            results: results.slice(0, 10), // Solo guardar top 10 para ahorrar espacio
            timestamp: Date.now(),
          }),
        );
      } catch (e) {
        console.warn('No se pudo persistir cache:', e);
      }
    }

    private retrieveFromStorage(key: string): PlayerDto[] | null {
      if (cacheStrategy === 'memory') return null;

      try {
        const storage = cacheStrategy === 'sessionStorage' ? sessionStorage : localStorage;
        const cacheKey = `playerSearch_${key}`;
        const data = storage.getItem(cacheKey);

        if (!data) return null;

        const parsed = JSON.parse(data);
        if (Date.now() - parsed.timestamp > this.ttl) {
          storage.removeItem(cacheKey);
          return null;
        }

        return parsed.results;
      } catch {
        return null;
      }
    }

    clear(): void {
      this.cache.clear();
      if (cacheStrategy !== 'memory') {
        const storage = cacheStrategy === 'sessionStorage' ? sessionStorage : localStorage;
        const keys = Object.keys(storage).filter((k) => k.startsWith('playerSearch_'));
        keys.forEach((k) => storage.removeItem(k));
      }
    }

    size(): number {
      return this.cache.size;
    }
  }

  const searchCache = new SearchCache();

  // Métricas y analytics
  // const trackSearch = (query: string, results: PlayerDto[], duration: number): void => {
  //   if (!enableAnalytics) return;
  //
  //   searchHistory.value.push({
  //     query,
  //     timestamp: Date.now(),
  //     resultCount: results.length,
  //   });
  //
  //   // Limitar historial
  //   if (searchHistory.value.length > 50) {
  //     searchHistory.value = searchHistory.value.slice(-50);
  //   }
  //
  //   // Track en analytics (ejemplo)
  //   if (window.gtag) {
  //     window.gtag('event', 'search', {
  //       search_term: query,
  //       results_count: results.length,
  //       search_duration: duration,
  //     });
  //   }
  // };

  // Inicialización optimizada con Web Worker opcional
  const initializeSearch = async (players: PlayerDto[]): Promise<void> => {
    if (state.value.isInitialized) {
      console.warn('Search engine ya inicializado');
      return;
    }

    state.value.isLoading = true;
    state.value.error = null;

    try {
      allPlayers.value = players;
      await initializeInChunks(players);
      state.value.isInitialized = true;

      // Pre-calentar cache con búsquedas comunes
      preWarmCache();
    } catch (error) {
      state.value.error = error as Error;
      console.error('Error inicializando búsqueda:', error);
      throw error;
    } finally {
      state.value.isLoading = false;
    }
  };

  const initializeInChunks = async (players: PlayerDto[]): Promise<void> => {
    const chunkSize = 1000;
    const chunks = Math.ceil(players.length / chunkSize);

    for (let i = 0; i < chunks; i++) {
      await new Promise((resolve) => {
        requestIdleCallback(
          () => {
            if (i === 0) {
              searchEngine = new PlayerSearchEngine(players);
            }
            resolve(undefined);
          },
          { timeout: 50 },
        );
      });
    }
  };

  // Pre-calentar cache con búsquedas comunes
  const preWarmCache = (): void => {
    if (!searchEngine) return;

    const commonSearches = ['a', 'e', 'i', 'o', 'u']; // Vocales comunes
    requestIdleCallback(() => {
      commonSearches.forEach((query) => {
        const results = searchEngine!.search(query);
        searchCache.set(query, results.slice(0, maxResults));
      });
    });
  };

  // Búsqueda principal con cancelación
  const performSearch = async (query: string): Promise<PlayerDto[]> => {
    if (!searchEngine || !query.trim()) {
      return [];
    }

    // Cancelar búsqueda anterior si existe
    if (searchAbortController) {
      searchAbortController.abort();
    }
    searchAbortController = new AbortController();

    const cacheKey = `${query.toLowerCase().trim()}_${JSON.stringify(filters.value)}`;

    // Verificar cache
    const cached = searchCache.get(cacheKey);
    if (cached) {
      state.value.totalSearches++;
      return cached;
    }

    const startTime = performance.now();

    try {
      // Simular async para permitir cancelación
      const results = await new Promise<PlayerDto[]>((resolve, reject) => {
        if (searchAbortController?.signal.aborted) {
          reject(new Error('Búsqueda cancelada'));
          return;
        }

        requestAnimationFrame(() => {
          try {
            let searchResults: PlayerDto[];

            // Usar búsqueda avanzada si hay filtros
            if (Object.keys(filters.value).length > 0) {
              searchResults = searchEngine!.advancedSearch(query, filters.value);
            } else {
              searchResults = searchEngine!.search(query);
            }

            resolve(searchResults.slice(0, maxResults));
          } catch (e) {
            const error = e as Error;
            reject(error);
          }
        });
      });

      const duration = performance.now() - startTime;

      // Guardar en cache y métricas
      searchCache.set(cacheKey, results);
      // trackSearch(query, results, duration);

      state.value.lastSearchTime = duration;
      state.value.totalSearches++;

      // Agregar a búsquedas recientes
      recentSearches.value.add(query);
      if (recentSearches.value.size > 10) {
        const firstValue = recentSearches.value.values().next().value;
        recentSearches.value.delete(firstValue);
      }

      return results;
    } catch (e) {
      const error = e as Error;
      if (error.message !== 'Búsqueda cancelada') {
        console.error('Error en búsqueda:', error);
        state.value.error = error;
      }
      return [];
    }
  };

  // Búsqueda con debounce mejorado
  const debouncedSearch = debounce(async (query: string) => {
    if (!query.trim()) {
      state.value.results = [];
      state.value.showSuggestions = false;
      return;
    }

    state.value.isLoading = true;
    state.value.error = null;

    try {
      const results = await performSearch(query);

      // Solo actualizar si la query no ha cambiado
      if (state.value.query === query) {
        state.value.results = results;

        // Obtener sugerencias si hay pocos resultados
        if (searchEngine && results.length < 3) {
          state.value.suggestions = searchEngine.getSuggestions(query, maxSuggestions);
          state.value.showSuggestions = state.value.suggestions.length > 0;
        } else {
          state.value.showSuggestions = false;
          state.value.suggestions = [];
        }
      }
    } catch (e) {
      const error = e as Error;
      if (error.message !== 'Búsqueda cancelada') {
        state.value.error = error;
        state.value.results = [];
      }
    } finally {
      state.value.isLoading = false;
    }
  }, debounceTime);

  // Búsqueda instantánea (sin debounce)
  const instantSearch = async (query: string): Promise<void> => {
    state.value.query = query;
    state.value.isLoading = true;

    try {
      state.value.results = await performSearch(query);
      state.value.showSuggestions = false;
    } finally {
      state.value.isLoading = false;
    }
  };

  // Búsqueda throttled para scroll infinito
  const throttledSearch = throttle(async (query: string) => {
    const results = await performSearch(query);
    state.value.results = [...state.value.results, ...results];
  }, 500);

  // Aplicar sugerencia
  const applySuggestion = async (suggestion: string): Promise<void> => {
    state.value.query = suggestion;
    state.value.showSuggestions = false;
    await instantSearch(suggestion);
  };

  const clearEngine = (): void => {
    searchEngine = null;
    searchAbortController = null;
    searchCache.clear();
    allPlayers.value = [];
    searchHistory.value = [];
    recentSearches.value = new Set();
    state.value.isInitialized = false;
  };

  // Limpiar búsqueda
  const clearSearch = (): void => {
    state.value.query = '';
    state.value.results = [];
    state.value.suggestions = [];
    state.value.showSuggestions = false;
    state.value.isLoading = false;
    state.value.error = null;

    // Cancelar búsquedas pendientes
    if (searchAbortController) {
      searchAbortController.abort();
    }
  };

  // Refrescar cache
  const refreshCache = (): void => {
    searchCache.clear();
    if (searchEngine) {
      searchEngine.clearCaches();
    }
    preWarmCache();
  };

  // Watchers optimizados
  watch(
    () => state.value.query,
    (newQuery) => {
      if (state.value.isInitialized) {
        debouncedSearch(newQuery);
      }
    },
  );

  // Watch para filtros
  watch(
    filters,
    () => {
      if (state.value.query && state.value.isInitialized) {
        debouncedSearch(state.value.query);
      }
    },
    { deep: true },
  );

  // Computed properties optimizados
  const hasNoResults = computed(
    () =>
      !state.value.isLoading &&
      state.value.query.trim().length > 0 &&
      state.value.results.length === 0 &&
      !state.value.error,
  );

  const shouldShowLoading = computed(
    () => state.value.isLoading && state.value.query.trim().length > 0,
  );

  const searchStats = computed(() => ({
    cacheSize: searchCache.size(),
    totalSearches: state.value.totalSearches,
    lastSearchTime: state.value.lastSearchTime,
    recentSearches: Array.from(recentSearches.value),
    engineStats: searchEngine?.getStats() || null,
  }));

  const topSearches = computed(() => {
    const frequency = searchHistory.value.reduce(
      (acc, item) => {
        acc[item.query] = (acc[item.query] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([query, count]) => ({ query, count }));
  });

  // Cleanup
  onUnmounted(() => {
    if (searchAbortController) {
      searchAbortController.abort();
    }

    searchCache.clear();
  });

  // API pública con readonly para prevenir mutaciones externas
  return {
    // Estado (readonly para evitar mutaciones externas)
    searchQuery: computed({
      get: () => state.value.query,
      set: (val) => {
        state.value.query = val;
      },
    }),
    searchResults: readonly(computed(() => state.value.results)),
    isLoading: readonly(shouldShowLoading),
    isInitialized: readonly(computed(() => state.value.isInitialized)),
    suggestions: readonly(computed(() => state.value.suggestions)),
    showSuggestions: readonly(computed(() => state.value.showSuggestions)),
    hasNoResults: readonly(hasNoResults),
    error: readonly(computed(() => state.value.error)),

    // Métodos principales
    initializeSearch,
    instantSearch,
    clearSearch,
    clearEngine,
    applySuggestion,
    refreshCache,

    // Métodos avanzados
    throttledSearch,

    // Estadísticas y analytics
    searchStats: readonly(searchStats),
    topSearches: readonly(topSearches),
    searchHistory: readonly(searchHistory),

    // Utilidades
    filters,
    setFilters: (newFilters: SearchFilters) => {
      filters.value = { ...filters.value, ...newFilters };
    },
    clearFilters: () => {
      filters.value = {};
    },
  };
}

export const useSharedPlayerSearch = createSharedComposable(usePlayerSearch);
