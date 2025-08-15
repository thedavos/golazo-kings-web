import { computed, ref, watch } from 'vue';
import { debounce } from 'quasar';
import { PlayerSearchEngine } from 'src/modules/shared/engines/PlayerSearchEngine';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';

export function usePlayerSearch() {
  const searchQuery = ref('');
  const searchResults = ref<PlayerDto[]>([]);
  const isLoading = ref(false);
  const isInitialized = ref(false);
  const suggestions = ref<string[]>([]);
  const showSuggestions = ref(false);

  let searchEngine: PlayerSearchEngine | null = null;

  const searchCache = new Map<string, PlayerDto[]>();
  const MAX_CACHE_SIZE = 100;

  const initializeSearch = async (players: PlayerDto[]) => {
    isLoading.value = true;
    try {
      // Usar setTimeout para no bloquear el UI thread
      await new Promise((resolve) => setTimeout(resolve, 0));
      searchEngine = new PlayerSearchEngine(players);
      isInitialized.value = true;
    } catch (error) {
      console.error('Error inicializando búsqueda:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const performSearch = (query: string): PlayerDto[] => {
    if (!searchEngine || !query.trim()) {
      return [];
    }

    const cacheKey = query.toLowerCase().trim();
    if (searchCache.has(cacheKey)) {
      return searchCache.get(cacheKey)!;
    }

    const results = searchEngine.search(query);

    if (searchCache.size >= MAX_CACHE_SIZE) {
      const firstKey = searchCache.keys().next().value;
      searchCache.delete(firstKey);
    }
    searchCache.set(cacheKey, results);

    return results;
  };

  const debouncedSearch = debounce((query: string) => {
    if (!query.trim()) {
      searchResults.value = [];
      showSuggestions.value = false;
      return;
    }

    isLoading.value = true;

    requestAnimationFrame(() => {
      try {
        const results = performSearch(query);
        searchResults.value = results;

        if (results.length < 3 && searchEngine) {
          suggestions.value = searchEngine.getSuggestions(query);
          showSuggestions.value = suggestions.value.length > 0;
        } else {
          showSuggestions.value = false;
        }
      } catch (error) {
        console.error('Error en búsqueda:', error);
        searchResults.value = [];
      } finally {
        isLoading.value = false;
      }
    });
  }, 300);

  const instantSearch = (query: string) => {
    searchResults.value = performSearch(query);
    showSuggestions.value = false;
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    searchQuery.value = '';
    searchResults.value = [];
    showSuggestions.value = false;
    isLoading.value = false;
  };

  // Watcher para el query con debounce
  watch(searchQuery, (newQuery) => {
    if (isInitialized.value) {
      debouncedSearch(newQuery);
    }
  });

  const hasNoResults = computed(() => {
    return (
      !isLoading.value && searchQuery.value.trim().length > 0 && searchResults.value.length === 0
    );
  });

  const shouldShowLoading = computed(() => {
    return isLoading.value && searchQuery.value.trim().length > 0;
  });

  return {
    // Estado
    searchQuery,
    searchResults,
    isLoading: shouldShowLoading,
    isInitialized,
    suggestions,
    showSuggestions,
    hasNoResults,

    // Métodos
    initializeSearch,
    instantSearch,
    clearSearch,

    // Utilidades
    searchCache: computed(() => searchCache.size),
  };
}
