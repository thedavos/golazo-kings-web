# 🔍 Sistema de Búsqueda de Jugadores

> Motor de búsqueda avanzado con indexación, búsqueda fuzzy, fonética y autocompletado optimizado para alto rendimiento

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura](#arquitectura)
- [Componentes](#componentes)
- [Motor de Búsqueda (Engine)](#motor-de-búsqueda-engine)
- [Composable de Búsqueda](#composable-de-búsqueda)
- [Algoritmos y Técnicas](#algoritmos-y-técnicas)
- [Optimizaciones de Performance](#optimizaciones-de-performance)
- [Flujos de Uso](#flujos-de-uso)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Métricas y Analytics](#métricas-y-analytics)
- [Mejoras Futuras](#mejoras-futuras)

---

## 📖 Descripción General

El **Sistema de Búsqueda de Jugadores** es un motor de búsqueda completo diseñado para proporcionar resultados rápidos y precisos al buscar jugadores en la aplicación. Soporta:

- ✅ **Búsqueda exacta**: Coincidencias precisas de texto
- ✅ **Búsqueda fuzzy**: Resultados incluso con errores ortográficos
- ✅ **Búsqueda fonética**: Encuentra nombres aunque estén mal escritos ("Gonsalez" → "González")
- ✅ **Autocompletado**: Sugerencias inteligentes mientras el usuario escribe
- ✅ **Filtros avanzados**: Por posición, equipo, liga, etc.
- ✅ **Ordenamiento flexible**: Por nombre, valor, rating
- ✅ **Cache multinivel**: LRU + sessionStorage/localStorage
- ✅ **Búsqueda por alias**: Encuentra jugadores por apodos

### 🎯 Objetivos del Sistema

1. **Performance**: Búsquedas instantáneas incluso con miles de jugadores
2. **Precisión**: Resultados relevantes con scoring inteligente
3. **Tolerancia a errores**: Encontrar jugadores aunque haya typos
4. **UX fluida**: Feedback inmediato y sugerencias útiles
5. **Escalabilidad**: Diseñado para manejar grandes volúmenes de datos

---

## 🏗️ Arquitectura

El sistema sigue una arquitectura en capas con separación clara de responsabilidades:

```
┌─────────────────────────────────────────────────────┐
│                   PRESENTACIÓN                      │
│  LineupSidebar, PlayerSearch (Vue Components)      │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│                   COMPOSABLES                       │
│  usePlayerSearch (Estado, Watchers, API)           │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│                  SEARCH ENGINE                      │
│  PlayerSearchEngine (Índices, Algoritmos)          │
│  - LRU Cache                                        │
│  - Trie (Autocompletado)                           │
│  - Índices invertidos                               │
│  - Algoritmos de similitud                         │
└─────────────────────────────────────────────────────┘
```

### 🔄 Flujo de Datos

```
Usuario escribe "Messi"
  ↓
PlayerSearch Component (v-model)
  ↓
usePlayerSearch (Debounce 300ms)
  ↓
PlayerSearchEngine.search()
  ↓
1. Verificar cache LRU
2. Normalizar query
3. Búsqueda exacta (índices)
4. Búsqueda fuzzy (si < 10 resultados)
5. Búsqueda fonética (si < 5 resultados)
  ↓
Ordenar por score + criterios secundarios
  ↓
Aplicar ordenamiento personalizado
  ↓
Guardar en cache
  ↓
Retornar resultados al componente
```

---

## 📁 Componentes

### 1. PlayerSearch Component

**Ubicación:** `src/modules/players/components/PlayerSearch/PlayerSearch.vue`

Componente de UI para la barra de búsqueda.

**Props:**
```typescript
interface Props {
  isLoading: boolean;
}
```

**Características:**
- ✅ Input con autofocus
- ✅ Icono de búsqueda y limpieza
- ✅ Estado de loading
- ✅ Manejo de focus/blur para sugerencias
- ✅ Integrado con `useSharedPlayerSearch`

**Ejemplo:**
```vue
<player-search :is-loading="isLoading" />
```

---

### 2. LineupSidebar Component

**Ubicación:** `src/modules/lineup-builder/components/LineupSidebar/LineupSidebar.vue`

Sidebar que integra búsqueda, filtros y lista de jugadores.

**Características:**
- ✅ Búsqueda con filtros desplegables
- ✅ Tres estados visuales:
  - Estado inicial (sin búsqueda)
  - Resultados de búsqueda
  - Sin resultados (con CTA para añadir jugador)
- ✅ Scroll area para resultados
- ✅ Integración completa con store de lineup
- ✅ Acciones: agregar al campo, agregar a banca, editar, mover, remover

**Estados:**
```typescript
// Estado 1: Inicial (sin búsqueda)
hasActiveSearch = false
searchResults.length = 0

// Estado 2: Con resultados
hasActiveSearch = true
searchResults.length > 0

// Estado 3: Sin resultados
hasActiveSearch = true
searchResults.length = 0
```

---

## 🧩 Composable de Búsqueda

### usePlayerSearch

**Ubicación:** `src/modules/players/composables/usePlayerSearch.ts`

Composable principal que gestiona el estado y la lógica de búsqueda.

#### Configuración

```typescript
interface SearchOptions {
  debounceTime?: number;         // Default: 300ms
  maxResults?: number;           // Default: 20
  maxSuggestions?: number;       // Default: 5
  enableWebWorker?: boolean;     // Default: false (futuro)
  enableAnalytics?: boolean;     // Default: false
  cacheStrategy?: 'memory' | 'sessionStorage' | 'localStorage';
  filters?: Ref<Filter>;         // Filtros reactivos
  sortBy?: Ref<OrderBySelectOption>; // Ordenamiento reactivo
}
```

#### Estado

```typescript
interface SearchState {
  query: string;                 // Query actual
  results: PlayerDto[];          // Resultados de búsqueda
  suggestions: string[];         // Sugerencias de autocompletado
  isLoading: boolean;            // Estado de carga
  isInitialized: boolean;        // Si el engine está listo
  showSuggestions: boolean;      // Mostrar dropdown de sugerencias
  error: Error | null;           // Error si lo hay
  lastSearchTime: number;        // Tiempo de última búsqueda (ms)
  totalSearches: number;         // Contador de búsquedas
}
```

#### API Pública

```typescript
const {
  // Estado (readonly)
  searchQuery,          // Ref<string> - Query reactivo
  searchResults,        // ComputedRef<PlayerDto[]>
  isLoading,           // ComputedRef<boolean>
  isInitialized,       // ComputedRef<boolean>
  suggestions,         // ComputedRef<string[]>
  showSuggestions,     // ComputedRef<boolean>
  hasNoResults,        // ComputedRef<boolean>
  error,              // ComputedRef<Error | null>

  // Métodos principales
  initializeSearch,    // (players: PlayerDto[]) => Promise<void>
  instantSearch,       // (query: string) => void
  clearSearch,         // () => void
  clearEngine,         // () => void
  applySuggestion,     // (suggestion: string) => void
  refreshCache,        // () => void
  setPlayers,          // (players: PlayerDto[]) => void

  // Métodos avanzados
  throttledSearch,     // (query: string) => void

  // Estadísticas
  searchStats,         // ComputedRef con métricas
  topSearches,         // ComputedRef con búsquedas frecuentes
  searchHistory,       // Readonly<SearchHistory[]>

  // Filtros
  filters,             // Ref<Filter>
  setFilters,          // (filters: Filter) => void
  clearFilters,        // () => void

  // Ordenamiento
  sortBy,              // Ref<OrderBySelectOption>
  setSortBy,           // (sort: OrderBySelectOption) => void
  resetSortBy,         // () => void
} = usePlayerSearch(options);
```

#### Shared Composable

```typescript
// Composable compartido entre múltiples componentes
export const useSharedPlayerSearch = createSharedComposable(usePlayerSearch);
```

**Ventajas:**
- ✅ Estado compartido entre componentes
- ✅ Una sola instancia del engine
- ✅ Cache compartido
- ✅ Sincronización automática

---

## 🔬 Motor de Búsqueda (Engine)

### PlayerSearchEngine

**Ubicación:** `src/modules/shared/engines/PlayerSearchEngine/playerSearchEngine.ts`

Motor de búsqueda avanzado con múltiples índices y algoritmos.

#### Índices Construidos

```typescript
class PlayerSearchEngine {
  // Índice principal: token → Set<playerIndex>
  private searchIndex: Map<string, Set<number>>;
  
  // Trie para autocompletado O(k) donde k = longitud del prefijo
  private trie: Trie;
  
  // Índices secundarios para filtrado rápido
  private positionIndex: Map<string, Set<number>>;
  private teamIndex: Map<string, Set<number>>;
  private leagueIndex: Map<string, Set<number>>;
  private queensLeagueIndex: Set<number>;
  private kingsLeagueIndex: Set<number>;
  private activePlayersIndex: Set<number>;
  
  // Índice de alias/apodos
  private aliasIndex: Map<string, number>;
  
  // Índice fonético (Soundex)
  private soundexIndex: Map<string, Set<number>>;
  
  // Caches
  private searchCache: LRUCache<string, PlayerDto[]>;
  private normalizationCache: StringNormalizationCache;
  private levenshteinCache: Map<string, number>;
  
  // Pre-computados
  private playerSearchableText: Map<number, string>;
}
```

#### Métodos Principales

##### 1. Constructor e Inicialización

```typescript
constructor(players: PlayerDto[])
```

**Complejidad:** O(n × m) donde n = número de jugadores, m = longitud promedio de campos

**Proceso:**
1. Construye todos los índices
2. Pre-computa texto buscable normalizado
3. Genera n-gramas para búsqueda parcial
4. Construye índices de posición, equipo, liga
5. Crea índice fonético (Soundex)
6. Inicializa caches

---

##### 2. search(query, sortBy?)

```typescript
public search(query: string, sortBy?: OrderBySelectOption): PlayerDto[]
```

**Complejidad:** O(1) con cache, O(k × log n) sin cache

**Proceso:**
1. Verificar cache LRU
2. Normalizar y tokenizar query
3. Búsqueda de alias (prioridad máxima)
4. Búsqueda exacta usando índices
5. Búsqueda fuzzy si hay pocos resultados
6. Búsqueda fonética como último recurso
7. Ordenar por score
8. Aplicar ordenamiento personalizado
9. Guardar en cache

**Scoring:**
```typescript
score = (levenshteinSimilarity × 0.6) + 
        (jaccardSimilarity × 0.4) + 
        (prefixBoost × 0.2) +
        (tokenBoost × 0.5) +
        (activeBoost × 0.1)
```

**Ejemplo:**
```typescript
const engine = new PlayerSearchEngine(players);

// Búsqueda simple
const results = engine.search('messi');

// Con ordenamiento
const sorted = engine.search('ronaldo', { 
  field: 'marketValue', 
  direction: 'desc' 
});
```

---

##### 3. advancedSearch(query, filters, sortBy?)

```typescript
public advancedSearch(
  query: string, 
  filters: Filter, 
  sortBy?: OrderBySelectOption
): PlayerDto[]
```

**Complejidad:** O(f + k × log n) donde f = costo de filtrado

**Proceso:**
1. Usar índices específicos para pre-filtrar
2. Intersección de conjuntos (eficiente)
3. Búsqueda solo en candidatos filtrados
4. Aplicar ordenamiento

**Optimización clave:** No reconstruye índices, busca directamente en candidatos.

**Filtros soportados:**
```typescript
interface Filter {
  position?: { value: string };
  team?: { label: string };
  league?: { 
    value: string; 
    type: 'kings' | 'queens' 
  };
}
```

**Ejemplo:**
```typescript
const results = engine.advancedSearch(
  'delantero',
  {
    team: { label: 'Real Madrid' },
    position: { value: 'DC' },
    league: { value: '1', type: 'kings' }
  },
  { field: 'rating', direction: 'desc' }
);
```

---

##### 4. getSuggestions(partialQuery, limit)

```typescript
public getSuggestions(partialQuery: string, limit: number = 5): string[]
```

**Complejidad:** O(k + m) donde k = longitud del prefijo, m = número de sugerencias

**Usa:** Estructura de datos Trie (árbol de prefijos)

**Ejemplo:**
```typescript
const suggestions = engine.getSuggestions('mes');
// → ['messi', 'mesut', 'messias']
```

---

##### 5. Métodos de Utilidad

```typescript
// Limpiar caches
clearCaches(): void

// Estadísticas básicas
getStats(): {
  totalPlayers: number;
  indexSize: number;
  cacheSize: number;
  activePlayers: number;
}

// Estadísticas detalladas
getDetailedStats(): {
  players: { total, active, inactive, queensLeague, kingsLeague };
  indices: { searchIndex, positions, teams, leagues, trieNodes };
  caches: { searches, levenshtein, playerSearchableText };
  memory: { estimatedMB };
}
```

---

## 🧠 Algoritmos y Técnicas

### 1. LRU Cache (Least Recently Used)

**Implementación real** con política de evicción automática.

```typescript
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private readonly maxSize: number;

  get(key: K): V | undefined {
    // Mover al final (más reciente)
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    // Si está lleno, eliminar el menos usado (primero)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}
```

**Ventajas:**
- O(1) para get y set
- Evicción automática
- Mantiene los más usados

---

### 2. Trie (Árbol de Prefijos)

Estructura de datos para autocompletado eficiente.

```typescript
class Trie {
  private root = new TrieNode();

  insert(word: string, playerIndex: number): void {
    // O(k) donde k = longitud de la palabra
  }

  searchPrefix(prefix: string): Set<number> {
    // O(k) donde k = longitud del prefijo
  }

  getSuggestions(prefix: string, limit: number): string[] {
    // O(k + m) donde m = número de sugerencias
  }
}
```

**Ventajas:**
- Búsqueda de prefijos en O(k)
- Autocompletado eficiente
- Memoria compartida para prefijos comunes

---

### 3. Soundex Español

Algoritmo fonético adaptado para español.

```typescript
class SpanishSoundex {
  static encode(text: string): string {
    // 1. Normalizar y convertir a minúsculas
    // 2. Aplicar reemplazos fonéticos:
    //    - Vocales → 0
    //    - B, P → 1
    //    - F, V → 2
    //    - C, G, J, K, Q, S, X, Z → 3
    //    - D, T → 4
    //    - L → 5
    //    - M, N, Ñ → 6
    //    - R → 7
    // 3. Eliminar duplicados consecutivos
    // 4. Retornar primeros 4 caracteres
  }
}
```

**Ejemplo:**
```typescript
SpanishSoundex.encode('González');  // → 'g653'
SpanishSoundex.encode('Gonsalez');  // → 'g653'
// ¡Mismo código! ✅
```

---

### 4. Distancia de Levenshtein

Calcula la similitud entre dos strings.

```typescript
private levenshteinDistance(a: string, b: string): number {
  // Programación dinámica con array unidimensional
  // Complejidad: O(n × m)
  // Cache para evitar recálculos
}
```

**Optimizaciones:**
- Early termination si diferencia de longitud > 5
- Array unidimensional (menos memoria)
- Cache con LRU

---

### 5. Similitud Combinada

```typescript
private calculateSimilarity(query: string, target: string): number {
  // Jaccard: similitud de conjuntos de caracteres
  const jaccardSimilarity = intersection.size / union.size;
  
  // Levenshtein: distancia de edición
  const levenshteinSimilarity = 1 - distance / maxLength;
  
  // Boost por prefijo
  const prefixBoost = target.startsWith(query) ? 0.2 : 0;
  
  // Combinar con pesos
  return (levenshteinSimilarity × 0.6) + 
         (jaccardSimilarity × 0.4) + 
         prefixBoost;
}
```

---

### 6. N-gramas

Para búsqueda parcial (substring matching).

```typescript
private addNGrams(text: string, playerIndex: number, minN: number, maxN: number): void {
  // "messi" con n=2 → ["me", "es", "ss", "si"]
  // "messi" con n=3 → ["mes", "ess", "ssi"]
}
```

**Uso:** Solo en nombres (firstName, lastName) para reducir tamaño del índice.

---

## ⚡ Optimizaciones de Performance

### 1. Índices Invertidos

```typescript
// Token → Jugadores que lo contienen
searchIndex: Map<string, Set<number>>

// Búsqueda en O(k) en lugar de O(n)
```

---

### 2. Pre-computación

```typescript
// Pre-computar texto normalizado una sola vez
private playerSearchableText: Map<number, string>;

// Evita normalizar en cada búsqueda
```

---

### 3. Cache Multinivel

```
1. LRU Cache en memoria (50 búsquedas)
2. sessionStorage (5 min TTL)
3. localStorage (opcional)
```

---

### 4. Lazy Initialization

```typescript
// Inicializar cuando el navegador esté idle
requestIdleCallback(() => {
  searchEngine = new PlayerSearchEngine(players);
});

// Pre-calentar cache en idle
requestIdleCallback(() => {
  commonSearches.forEach(query => {
    engine.search(query);
  });
});
```

---

### 5. Debouncing Inteligente

```typescript
// Evitar búsquedas mientras el usuario escribe
const debouncedSearch = debounce((query: string) => {
  // Búsqueda real
}, 300);
```

---

### 6. Shallow Refs

```typescript
// Para arrays grandes
const allPlayers = shallowRef<PlayerDto[]>([]);

// Evita reactividad profunda innecesaria
```

---

### 7. Intersección Eficiente

```typescript
// Ordenar tokens por frecuencia (menos frecuentes primero)
const tokensByFrequency = tokens.sort((a, b) => 
  indexSize(a) - indexSize(b)
);

// Empezar con conjunto más pequeño
let result = new Set(searchIndex.get(tokensByFrequency[0]));

// Intersección incremental con early exit
for (const token of restTokens) {
  if (result.size === 0) break; // Early exit
  result = intersect(result, searchIndex.get(token));
}
```

---

## 🔄 Flujos de Uso

### Flujo 1: Búsqueda Simple

```
Usuario escribe "messi"
  ↓
PlayerSearch: v-model actualiza searchQuery
  ↓
usePlayerSearch: watcher detecta cambio
  ↓
Debounce 300ms
  ↓
performSearch("messi")
  ↓
1. Cache hit? → Retornar
2. Cache miss → Continuar
  ↓
PlayerSearchEngine.search("messi")
  ↓
1. Normalizar: "messi"
2. Buscar alias: No encontrado
3. Búsqueda exacta: 1 resultado
4. Score y ordenar
  ↓
Guardar en cache
  ↓
searchResults actualizados
  ↓
PlayerList renderiza resultados
```

---

### Flujo 2: Búsqueda con Filtros

```
Usuario abre filtros y selecciona:
- Posición: Delantero
- Equipo: Real Madrid
  ↓
Filters ref actualizado
  ↓
usePlayerSearch: watcher de filters
  ↓
Verificar cambio real (JSON.stringify)
  ↓
Debounce 300ms
  ↓
advancedSearch(query, filters)
  ↓
1. Usar positionIndex → Set A
2. Usar teamIndex → Set B
3. Intersección: A ∩ B = candidatos
  ↓
4. Buscar en candidatos filtrados
5. Score y ordenar
  ↓
searchResults actualizados
```

---

### Flujo 3: Autocompletado

```
Usuario escribe "mes" (< 3 resultados)
  ↓
performSearch genera pocos resultados
  ↓
engine.getSuggestions("mes", 5)
  ↓
Trie navega hasta nodo "mes"
  ↓
DFS para encontrar palabras completas
  ↓
suggestions = ["messi", "mesut", "messias"]
  ↓
showSuggestions = true
  ↓
Usuario ve dropdown con sugerencias
  ↓
Click en sugerencia
  ↓
applySuggestion("messi")
  ↓
instantSearch("messi")
```

---

### Flujo 4: Cambio de Ordenamiento

```
Usuario selecciona "Valor de Mercado (Mayor a Menor)"
  ↓
sortBy ref actualizado
  ↓
usePlayerSearch: watcher de sortBy
  ↓
Verificar cambio real
  ↓
Re-ejecutar búsqueda actual
  ↓
Resultados re-ordenados por marketValue DESC
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Búsqueda Básica

```vue
<script setup lang="ts">
import { useSharedPlayerSearch } from 'src/modules/players/composables/usePlayerSearch';

const { 
  searchQuery, 
  searchResults, 
  isLoading,
  initializeSearch 
} = useSharedPlayerSearch();

// Inicializar con jugadores
await initializeSearch(players);
</script>

<template>
  <div>
    <player-search :is-loading="isLoading" />
    
    <div v-if="isLoading">Buscando...</div>
    
    <div v-else>
      <div v-for="player in searchResults" :key="player.id">
        {{ player.firstName }} {{ player.lastName }}
      </div>
    </div>
  </div>
</template>
```

---

### Ejemplo 2: Búsqueda con Filtros

```typescript
import { ref } from 'vue';
import { useSharedPlayerSearch } from 'src/modules/players/composables/usePlayerSearch';

const filters = ref<Filter>({
  position: { value: 'DC' },
  team: { label: 'Real Madrid' },
});

const { 
  searchQuery,
  searchResults,
  initializeSearch 
} = useSharedPlayerSearch({ filters });

await initializeSearch(players);

// Cambiar filtros dinámicamente
filters.value = {
  ...filters.value,
  league: { value: '1', type: 'kings' }
};
```

---

### Ejemplo 3: Ordenamiento Dinámico

```typescript
const sortBy = ref<OrderBySelectOption>({
  field: 'marketValue',
  direction: 'desc',
  label: 'Valor (Mayor a Menor)'
});

const { searchResults } = useSharedPlayerSearch({ sortBy });

// Cambiar orden
sortBy.value = {
  field: 'name',
  direction: 'asc',
  label: 'Nombre (A-Z)'
};
```

---

### Ejemplo 4: Estadísticas

```typescript
const { searchStats } = useSharedPlayerSearch();

console.log(searchStats.value);
// {
//   totalSearches: 42,
//   lastSearchTime: 2.3,
//   recentSearches: ['messi', 'ronaldo', 'benzema'],
//   engineStats: {
//     totalPlayers: 5000,
//     indexSize: 12500,
//     cacheSize: 15,
//     activePlayers: 4200
//   },
//   detailedEngineStats: { ... }
// }
```

---

### Ejemplo 5: Búsqueda Instantánea (sin debounce)

```typescript
const { instantSearch, searchResults } = useSharedPlayerSearch();

// Para búsquedas desde botones o selects
const handleQuickSearch = (playerName: string) => {
  instantSearch(playerName);
};
```

---

### Ejemplo 6: Actualizar Jugadores Dinámicamente

```typescript
const { setPlayers } = useSharedPlayerSearch();

// Cuando se modifica un jugador
watch(players, (newPlayers) => {
  setPlayers(newPlayers);
  // El engine se reinicializa automáticamente
}, { deep: true });
```

---

## 📊 Métricas y Analytics

### Estadísticas Básicas

```typescript
const stats = engine.getStats();
// {
//   totalPlayers: 5000,
//   indexSize: 12500,        // Número de tokens únicos
//   cacheSize: 15,           // Búsquedas en cache
//   activePlayers: 4200
// }
```

---

### Estadísticas Detalladas

```typescript
const detailedStats = engine.getDetailedStats();
// {
//   players: {
//     total: 5000,
//     active: 4200,
//     inactive: 800,
//     queensLeague: 1500,
//     kingsLeague: 3500
//   },
//   indices: {
//     searchIndex: { size: 12500, tokens: 12500 },
//     positions: 10,
//     teams: 200,
//     leagues: 2,
//     trieNodes: '~25000 nodos'
//   },
//   caches: {
//     searches: { size: 15, maxSize: 50, hitRate: 'N/A' },
//     levenshtein: { size: 120, maxSize: 300 },
//     playerSearchableText: 5000
//   },
//   memory: {
//     estimatedMB: 8.5
//   }
// }
```

---

### Historial de Búsquedas

```typescript
const { topSearches, searchHistory } = useSharedPlayerSearch();

console.log(topSearches.value);
// [
//   { query: 'messi', count: 10 },
//   { query: 'ronaldo', count: 8 },
//   { query: 'benzema', count: 5 }
// ]
```

---

## 🎯 Casos de Uso Avanzados

### 1. Búsqueda Tolerante a Errores

```typescript
// Usuario escribe mal
engine.search('messy');      // → Lionel Messi
engine.search('Gonsalez');   // → Julio González (fonética)
engine.search('benzma');     // → Karim Benzema (fuzzy)
```

---

### 2. Búsqueda por Alias

```typescript
engine.search('CR7');        // → Cristiano Ronaldo
engine.search('Chimy');      // → Santiago Chimino
```

---

### 3. Búsqueda Multiidioma

```typescript
// Normalización automática
engine.search('müller');     // → muller
engine.search('José');       // → jose
```

---

### 4. Búsqueda Parcial

```typescript
// N-gramas permiten búsqueda substring
engine.search('ess');        // → Messi (contiene 'ess')
```

---

## 🚀 Mejoras Futuras

### Corto Plazo

- [ ] **Web Workers**: Mover búsquedas pesadas a worker threads
- [ ] **Hit Rate Tracking**: Métricas de efectividad del cache
- [ ] **Search Analytics**: Tracking completo con GTM/GA4
- [ ] **Highlights**: Resaltar términos coincidentes en resultados

### Mediano Plazo

- [ ] **Búsqueda Semántica**: Similitud vectorial con embeddings
- [ ] **Personalización**: Resultados basados en historial del usuario
- [ ] **A/B Testing**: Experimentar con diferentes algoritmos
- [ ] **Infinite Scroll**: Cargar más resultados bajo demanda

### Largo Plazo

- [ ] **ML Ranking**: Ordenar resultados con machine learning
- [ ] **Query Expansion**: Expandir queries automáticamente
- [ ] **Federated Search**: Buscar en múltiples fuentes
- [ ] **Voice Search**: Búsqueda por voz

---

## 🧪 Testing

### Tests Recomendados

```typescript
describe('PlayerSearchEngine', () => {
  describe('Exact Search', () => {
    it('should find player by exact name', () => {
      const results = engine.search('Lionel Messi');
      expect(results[0].firstName).toBe('Lionel');
    });
  });

  describe('Fuzzy Search', () => {
    it('should find player with typos', () => {
      const results = engine.search('messy');
      expect(results.some(p => p.lastName === 'Messi')).toBe(true);
    });
  });

  describe('Phonetic Search', () => {
    it('should find player phonetically', () => {
      const results = engine.search('Gonsalez');
      expect(results.some(p => p.lastName === 'González')).toBe(true);
    });
  });

  describe('Alias Search', () => {
    it('should find player by alias', () => {
      const results = engine.search('CR7');
      expect(results[0].lastName).toBe('Ronaldo');
    });
  });

  describe('Advanced Search', () => {
    it('should filter by position', () => {
      const results = engine.advancedSearch('', {
        position: { value: 'DC' }
      });
      expect(results.every(p => p.position === 'DC')).toBe(true);
    });
  });

  describe('Suggestions', () => {
    it('should provide autocomplete suggestions', () => {
      const suggestions = engine.getSuggestions('mes');
      expect(suggestions).toContain('messi');
    });
  });

  describe('Cache', () => {
    it('should cache search results', () => {
      engine.search('messi');
      const stats1 = engine.getStats();
      
      engine.search('messi'); // Cache hit
      const stats2 = engine.getStats();
      
      expect(stats2.cacheSize).toBeGreaterThan(stats1.cacheSize);
    });
  });
});
```

---

## 📚 Referencias

- **Algoritmos:**
  - [Levenshtein Distance](https://en.wikipedia.org/wiki/Levenshtein_distance)
  - [Soundex Algorithm](https://en.wikipedia.org/wiki/Soundex)
  - [Trie Data Structure](https://en.wikipedia.org/wiki/Trie)
  - [LRU Cache](https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_recently_used_(LRU))

- **Performance:**
  - [requestIdleCallback](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback)
  - [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)

- **Vue/VueUse:**
  - [createSharedComposable](https://vueuse.org/shared/createSharedComposable/)
  - [Shallow Refs](https://vuejs.org/api/reactivity-advanced.html#shallowref)

---

## 👥 Contribución

Al trabajar en este módulo:

1. ✅ Mantener índices sincronizados con datos
2. ✅ Limpiar caches cuando sea apropiado
3. ✅ Documentar nuevos algoritmos de scoring
4. ✅ Medir performance de cambios (searchStats)
5. ✅ Escribir tests para nuevos tipos de búsqueda
6. ✅ Considerar trade-offs memoria vs velocidad

---

## 📝 Changelog

### [1.0.0] - 2025-10-07

#### Added
- ✨ Motor de búsqueda completo con múltiples índices
- ✨ Búsqueda exacta, fuzzy y fonética
- ✨ Autocompletado con Trie
- ✨ Cache multinivel (LRU + storage)
- ✨ Filtros avanzados (posición, equipo, liga)
- ✨ Ordenamiento flexible
- ✨ Normalización y tokenización optimizada
- ✨ Algoritmo Soundex adaptado para español
- ✨ N-gramas para búsqueda parcial
- ✨ Métricas y estadísticas detalladas
- 📚 Documentación completa del sistema

---

**Última actualización:** 7 de octubre de 2025  
**Versión:** 1.0.0  
**Autor:** Golazo Kings Team
