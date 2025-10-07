import { computed, onUnmounted, readonly, ref, type Ref, shallowRef, watch } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import { debounce, throttle } from 'quasar';
import { PlayerSearchEngine } from 'src/modules/shared/engines/PlayerSearchEngine';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';
import type { Filter } from 'src/modules/lineup-builder/types';
import {
  ORDER_BY_DEFAULT,
  type OrderBySelectOption,
} from 'src/modules/lineup-builder/constants/orderBy.constant';

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
    filters?: Ref<Filter>;
    sortBy?: Ref<OrderBySelectOption>;
  } = {},
) {
  const {
    debounceTime = 300,
    maxResults = 20,
    maxSuggestions = 5,
    // enableAnalytics = false,
    cacheStrategy = 'memory',
    filters = ref({} as Filter),
    sortBy = ref(ORDER_BY_DEFAULT), // Orden predeterminado: Nombre (A-Z)
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

  // Engine
  let searchEngine: PlayerSearchEngine | null = null;

  // Cache opcional en storage (solo para persistencia entre sesiones)
  // El cache principal está en PlayerSearchEngine
  const storageCache = {
    get(key: string): PlayerDto[] | null {
      if (cacheStrategy === 'memory') return null;

      try {
        const storage = cacheStrategy === 'sessionStorage' ? sessionStorage : localStorage;
        const cacheKey = `playerSearch_${key}`;
        const data = storage.getItem(cacheKey);
        if (!data) return null;

        const parsed = JSON.parse(data);
        const ttl = 5 * 60 * 1000; // 5 minutos
        if (Date.now() - parsed.timestamp > ttl) {
          storage.removeItem(cacheKey);
          return null;
        }

        return parsed.results;
      } catch {
        return null;
      }
    },

    set(key: string, results: PlayerDto[]): void {
      if (cacheStrategy === 'memory') return;

      try {
        const storage = cacheStrategy === 'sessionStorage' ? sessionStorage : localStorage;
        const cacheKey = `playerSearch_${key}`;
        storage.setItem(
          cacheKey,
          JSON.stringify({
            results: results.slice(0, 10),
            timestamp: Date.now(),
          }),
        );
      } catch (e) {
        console.warn('No se pudo persistir cache:', e);
      }
    },

    clear(): void {
      if (cacheStrategy === 'memory') return;

      const storage = cacheStrategy === 'sessionStorage' ? sessionStorage : localStorage;
      const keys = Object.keys(storage).filter((k) => k.startsWith('playerSearch_'));
      keys.forEach((k) => storage.removeItem(k));
    },
  };

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

  // Inicializar engine cuando el navegador esté idle
  const initializeInChunks = async (players: PlayerDto[]): Promise<void> => {
    return new Promise((resolve) => {
      requestIdleCallback(
        () => {
          searchEngine = new PlayerSearchEngine(players);
          resolve(undefined);
        },
        { timeout: 100 },
      );
    });
  };

  // Pre-calentar cache con búsquedas comunes y realistas
  const preWarmCache = (): void => {
    if (!searchEngine) return;

    // Búsquedas más realistas que solo vocales
    const commonSearches = ['mar', 'ron', 'mes', 'cris', 'leon'];
    requestIdleCallback(() => {
      commonSearches.forEach((query) => {
        // Solo ejecutar para poblar el cache interno del engine
        searchEngine!.search(query);
        // Storage cache opcional
        const cacheKey = `${query.toLowerCase().trim()}_${JSON.stringify(filters.value)}`;
        storageCache.set(cacheKey, searchEngine!.search(query).slice(0, maxResults));
      });
    });
  };

  // Búsqueda principal simplificada (síncrona)
  const performSearch = (query: string): PlayerDto[] => {
    if (!searchEngine || !query.trim()) {
      return [];
    }

    const cacheKey = `${query.toLowerCase().trim()}_${JSON.stringify(filters.value)}`;

    // Verificar cache de storage primero
    const cachedFromStorage = storageCache.get(cacheKey);
    if (cachedFromStorage) {
      state.value.totalSearches++;
      return cachedFromStorage;
    }

    const startTime = performance.now();

    try {
      let searchResults: PlayerDto[];

      // Usar búsqueda avanzada si hay filtros
      if (Object.keys(filters.value).length > 0) {
        searchResults = searchEngine.advancedSearch(query, filters.value, sortBy.value);
      } else {
        searchResults = searchEngine.search(query, sortBy.value);
      }

      const results = searchResults.slice(0, maxResults);
      const duration = performance.now() - startTime;

      // Persistir en storage si está configurado
      storageCache.set(cacheKey, results);

      state.value.lastSearchTime = duration;
      state.value.totalSearches++;

      // Agregar a búsquedas recientes
      recentSearches.value.add(query);
      if (recentSearches.value.size > 10) {
        const firstValue = recentSearches.value.values().next().value;
        recentSearches.value.delete(firstValue);
      }

      return results;
    } catch (error) {
      console.error('Error en búsqueda:', error);
      state.value.error = error as Error;
      return [];
    }
  };

  // Búsqueda con debounce optimizado
  const debouncedSearch = debounce((query: string) => {
    if (!query.trim()) {
      state.value.results = [];
      state.value.showSuggestions = false;
      return;
    }

    state.value.isLoading = true;
    state.value.error = null;

    try {
      const results = performSearch(query);

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
    } catch (error) {
      state.value.error = error as Error;
      state.value.results = [];
    } finally {
      state.value.isLoading = false;
    }
  }, debounceTime);

  // Búsqueda instantánea (sin debounce)
  const instantSearch = (query: string): void => {
    state.value.query = query;
    state.value.isLoading = true;

    try {
      state.value.results = performSearch(query);
      state.value.showSuggestions = false;
    } finally {
      state.value.isLoading = false;
    }
  };

  // Búsqueda throttled para scroll infinito
  const throttledSearch = throttle((query: string) => {
    const results = performSearch(query);
    state.value.results = [...state.value.results, ...results];
  }, 500);

  // Aplicar sugerencia
  const applySuggestion = (suggestion: string): void => {
    state.value.query = suggestion;
    state.value.showSuggestions = false;
    instantSearch(suggestion);
  };

  const clearEngine = (): void => {
    searchEngine = null;
    storageCache.clear();
    allPlayers.value = [];
    searchHistory.value = [];
    recentSearches.value = new Set();
    state.value.isInitialized = false;
  };

  const setPlayers = (players: PlayerDto[]): void => {
    allPlayers.value = players;
    // Reinicializar el search engine con los nuevos datos para reconstruir índices
    if (searchEngine && state.value.isInitialized) {
      searchEngine = new PlayerSearchEngine(players);
      // Re-ejecutar búsqueda actual si existe para mostrar resultados actualizados
      if (state.value.query.trim()) {
        instantSearch(state.value.query);
      }
    }
  };

  // Limpiar búsqueda
  const clearSearch = (): void => {
    state.value.query = '';
    state.value.results = [];
    state.value.suggestions = [];
    state.value.showSuggestions = false;
    state.value.isLoading = false;
    state.value.error = null;
  };

  // Refrescar cache
  const refreshCache = (): void => {
    storageCache.clear();
    if (searchEngine) {
      searchEngine.clearCaches();
    }
    preWarmCache();
  };

  // Watchers optimizados con prevención de búsquedas redundantes
  let lastFilterString = JSON.stringify(filters.value);

  watch(
    () => state.value.query,
    (newQuery, oldQuery) => {
      // Solo buscar si cambió realmente y está inicializado
      if (state.value.isInitialized && newQuery !== oldQuery) {
        debouncedSearch(newQuery);
      }
    },
  );

  // Watch para filtros con detección de cambios reales
  watch(
    filters,
    (newFilters) => {
      const newFilterString = JSON.stringify(newFilters);
      // Solo buscar si los filtros realmente cambiaron
      if (newFilterString !== lastFilterString && state.value.query && state.value.isInitialized) {
        lastFilterString = newFilterString;
        debouncedSearch(state.value.query);
      }
    },
    { deep: true },
  );

  // Watch para sortBy - reejecutar búsqueda cuando cambie el orden
  watch(
    sortBy,
    (newSort, oldSort) => {
      // Solo si cambió realmente y hay query
      if (
        newSort.value !== oldSort?.value &&
        state.value.query &&
        state.value.isInitialized
      ) {
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
    totalSearches: state.value.totalSearches,
    lastSearchTime: state.value.lastSearchTime,
    recentSearches: Array.from(recentSearches.value),
    engineStats: searchEngine?.getStats() || null,
    detailedEngineStats: searchEngine?.getDetailedStats() || null,
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
    storageCache.clear();
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
    setPlayers,

    // Métodos avanzados
    throttledSearch,

    // Estadísticas y analytics
    searchStats: readonly(searchStats),
    topSearches: readonly(topSearches),
    searchHistory: readonly(searchHistory),

    // Utilidades
    filters,
    setFilters: (newFilters: Filter) => {
      filters.value = { ...filters.value, ...newFilters };
    },
    clearFilters: () => {
      filters.value = {};
    },

    // Ordenamiento
    sortBy,
    setSortBy: (newSort: OrderBySelectOption) => {
      sortBy.value = newSort;
    },
    resetSortBy: () => {
      sortBy.value = ORDER_BY_DEFAULT;
    },
  };
}

export const useSharedPlayerSearch = createSharedComposable(usePlayerSearch);
