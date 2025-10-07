# 📦 Módulo: Saved Lineups

> Sistema de persistencia y gestión de alineaciones guardadas usando IndexedDB con Pinia

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura](#arquitectura)
- [Estructura del Módulo](#estructura-del-módulo)
- [Componentes Principales](#componentes-principales)
- [Store: useSavedLineupsStore](#store-usesavedlineupsstore)
- [Entidad de Dominio](#entidad-de-dominio)
- [DTOs y Mappers](#dtos-y-mappers)
- [Composables](#composables)
- [Constantes](#constantes)
- [Patrones y Convenciones](#patrones-y-convenciones)
- [Flujos de Usuario](#flujos-de-usuario)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Testing](#testing)
- [Mejoras Futuras](#mejoras-futuras)

---

## 📖 Descripción General

El módulo `saved-lineups` proporciona funcionalidad completa para:

- ✅ **Guardar alineaciones** con toda su configuración (jugadores, formación, equipo, coach, presupuesto)
- ✅ **Listar alineaciones guardadas** con información resumida y búsqueda
- ✅ **Cargar alineaciones** para continuar editándolas
- ✅ **Duplicar alineaciones** para crear variantes
- ✅ **Eliminar alineaciones** con confirmación
- ✅ **Persistencia automática** usando IndexedDB vía Pinia + persistedState + localforage
- ✅ **Búsqueda y filtrado** por nombre, formación y equipo

### 🎯 Objetivos del módulo

1. **Persistencia confiable**: Datos guardados localmente sin depender de backend
2. **UX limpia**: Interfaz intuitiva para gestionar alineaciones
3. **Arquitectura DDD**: Separación clara entre dominio, aplicación y presentación
4. **Patrones consistentes**: Seguir convenciones establecidas en el proyecto

---

## 🏗️ Arquitectura

El módulo sigue una **arquitectura en capas** inspirada en Domain-Driven Design (DDD):

```
┌─────────────────────────────────────────────────────┐
│                   PRESENTACIÓN                      │
│  Components, Pages, Composables                     │
│  (SavedLineupCard, SavedLineupsPage)                │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│                   APLICACIÓN                        │
│  Store (useSavedLineupsStore)                       │
│  Helpers (handleSaveLineup)                         │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│                    DOMINIO                          │
│  Entities (SavedLineupEntity)                       │
│  DTOs, Mappers, Validaciones                        │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│                INFRAESTRUCTURA                      │
│  Pinia persistedState + localforage (IndexedDB)    │
└─────────────────────────────────────────────────────┘
```

### 🔄 Flujo de datos

1. **Componente** dispara acción (ej: guardar alineación)
2. **Store** valida y procesa la operación
3. **Entity** aplica reglas de negocio
4. **Mapper** transforma entre Entity ↔ DTO
5. **Pinia plugin** persiste automáticamente en IndexedDB
6. **Feedback** notifica al usuario del resultado

---

## 📁 Estructura del Módulo

```
src/modules/saved-lineups/
├── components/
│   └── SavedLineupCard/          # Card para mostrar alineación guardada
│       ├── SavedLineupCard.vue
│       └── index.ts
├── composables/
│   ├── index.ts                  # Barrel export
│   ├── useSavedLineupsDialogs.ts # Dialogs de confirmación
│   └── useSavedLineupsFeedback.ts # Notificaciones al usuario
├── constants/
│   ├── index.ts
│   └── savedLineupsState.constant.ts # Estados de operaciones
├── domain/
│   └── entities/
│       └── saved-lineup.entity.ts # Entidad de dominio
├── dtos/
│   └── saved-lineup.dto.ts        # DTOs para transferencia de datos
├── mappers/
│   └── saved-lineup.mapper.ts     # Transformadores Entity ↔ DTO
└── pages/
    └── SavedLineupsPage/          # Página principal del módulo
        ├── SavedLineupsPage.vue
        └── index.ts
```

**Documentación:** `docs/SAVED_LINEUPS_MODULE.md`

---

## 🧩 Componentes Principales

### 1. SavedLineupCard

Card visual que muestra información resumida de una alineación guardada.

**Ubicación:** `components/SavedLineupCard/SavedLineupCard.vue`

**Props:**
```typescript
interface Props {
  lineup: SavedLineupSummaryDto;
}
```

**Eventos:**
```typescript
{
  load: [lineupId: string];      // Cargar alineación
  delete: [lineupId: string];    // Eliminar alineación
  duplicate: [lineupId: string]; // Duplicar alineación
}
```

**Características:**
- ✅ Badge de estado (completa/incompleta)
- ✅ Nombre destacado con emoji ⚽
- ✅ Información de equipo y coach con iconos
- ✅ Stats grid compacto (campo, banca, presupuesto)
- ✅ Meta info: formación, fecha creación y actualización
- ✅ Acciones: Eliminar, Duplicar, Cargar
- ✅ Hover effects con elevación

**Ejemplo de uso:**
```vue
<saved-lineup-card
  :lineup="lineup"
  @load="handleLoadLineup"
  @delete="handleDeleteLineup"
  @duplicate="handleDuplicateLineup"
/>
```

### 2. SavedLineupsPage

Página principal que lista todas las alineaciones guardadas.

**Ubicación:** `pages/SavedLineupsPage/SavedLineupsPage.vue`

**Características:**
- ✅ Lista de alineaciones en grid responsive (1-3 columnas)
- ✅ Barra de búsqueda con filtrado en tiempo real
- ✅ Estado vacío con CTA para crear nueva alineación
- ✅ Estado de "sin resultados" para búsquedas vacías
- ✅ Contador de alineaciones guardadas
- ✅ Integración completa con store y composables

**Ruta:** `/lineups`

---

## 🏪 Store: useSavedLineupsStore

Store central de Pinia para gestión de alineaciones guardadas.

**Ubicación:** `src/stores/useSavedLineupsStore.ts`

### Estado (State)

```typescript
{
  savedLineups: SavedLineupDto[];           // Alineaciones guardadas
  saveState: SavedLineupsStateType;         // Estado de operación actual
  lastErrorMessage: string | null;          // Mensaje del último error
}
```

### Computed Properties

| Property | Tipo | Descripción |
|----------|------|-------------|
| `isLoading` | `boolean` | Verifica si hay operación en curso |
| `hasError` | `boolean` | Verifica si hubo error |
| `isSuccess` | `boolean` | Verifica si última operación fue exitosa |
| `lineupSummaries` | `SavedLineupSummaryDto[]` | Resúmenes de todas las alineaciones |
| `lineupsSortedByDate` | `SavedLineupSummaryDto[]` | Alineaciones ordenadas por fecha (más recientes primero) |
| `totalLineups` | `number` | Número total de alineaciones |
| `hasLineups` | `boolean` | Verifica si hay alineaciones guardadas |
| `completeLineups` | `SavedLineupSummaryDto[]` | Solo alineaciones completas (≥11 jugadores) |

### Acciones (Actions)

#### `saveCurrentLineup(): SavedLineupEntity`

Guarda la alineación actual del `useLineupStore`.

**Comportamiento:**
- Si existe una alineación con el mismo nombre, la **actualiza**
- Si no existe, la **crea nueva**
- Valida que tenga nombre antes de guardar
- Actualiza automáticamente la fecha de modificación

**Lanza error si:**
- El nombre está vacío
- Hay error en validación de la entidad

**Ejemplo:**
```typescript
const savedLineupsStore = useSavedLineupsStore();

try {
  const savedEntity = savedLineupsStore.saveCurrentLineup();
  console.log('Alineación guardada:', savedEntity.name);
} catch (error) {
  console.error('Error al guardar:', error);
}
```

#### `loadLineup(lineupId: string): void`

Carga una alineación por ID y restaura su estado en `useLineupStore`.

**Restaura:**
- Nombre, equipo, coach
- Formación y presupuesto
- Jugadores en campo y banca
- Posiciones en el campo
- Jugadores modificados
- Configuración de visibilidad

**Lanza error si:**
- La alineación no existe
- Hay error al restaurar el estado

**Ejemplo:**
```typescript
try {
  savedLineupsStore.loadLineup('lineup_123');
  // Estado del lineup restaurado en useLineupStore
} catch (error) {
  console.error('Error al cargar:', error);
}
```

#### `deleteLineup(lineupId: string): void`

Elimina una alineación por ID.

**Lanza error si:**
- La alineación no existe

**Ejemplo:**
```typescript
try {
  savedLineupsStore.deleteLineup('lineup_123');
  console.log('Alineación eliminada');
} catch (error) {
  console.error('Error al eliminar:', error);
}
```

#### `duplicateLineup(lineupId: string): SavedLineupEntity`

Duplica una alineación existente con nombre modificado.

**Comportamiento:**
- Añade " (Copia)" al nombre
- Genera nuevo ID
- Actualiza fecha de creación y modificación

**Lanza error si:**
- La alineación original no existe

**Ejemplo:**
```typescript
try {
  const duplicated = savedLineupsStore.duplicateLineup('lineup_123');
  console.log('Duplicada como:', duplicated.name);
} catch (error) {
  console.error('Error al duplicar:', error);
}
```

#### `getLineupById(lineupId: string): SavedLineupSummaryDto | undefined`

Obtiene el resumen de una alineación por ID.

**Retorna:** `SavedLineupSummaryDto | undefined`

**Ejemplo:**
```typescript
const lineup = savedLineupsStore.getLineupById('lineup_123');
if (lineup) {
  console.log('Encontrada:', lineup.name);
}
```

#### `searchLineups(query: string): SavedLineupSummaryDto[]`

Busca alineaciones por nombre, formación o equipo.

**Características:**
- Case-insensitive
- Busca en: nombre, formación, nombre del equipo

**Ejemplo:**
```typescript
const results = savedLineupsStore.searchLineups('4-3-3');
console.log(`Encontradas ${results.length} alineaciones`);
```

#### `clearAllLineups(): void`

Elimina todas las alineaciones guardadas.

**⚠️ Advertencia:** Acción irreversible.

**Ejemplo:**
```typescript
savedLineupsStore.clearAllLineups();
```

---

## 🎯 Entidad de Dominio

### SavedLineupEntity

Entidad que representa una alineación guardada con sus reglas de negocio.

**Ubicación:** `domain/entities/saved-lineup.entity.ts`

**Propiedades:**

```typescript
class SavedLineupEntity {
  readonly id: string;
  readonly name: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly formation: FormationOption;
  readonly team: TeamSelectOption | null;
  readonly coach: CoachSelectOption | null;
  readonly budget: number;
  readonly currency: CurrencyOption;
  readonly players: LineupPlayer[];
  readonly fieldSlots: Map<string, FieldSlot>;
  readonly showTeamInLineup: boolean;
  readonly showCoachInLineup: boolean;
  readonly playersModified: PlayerDto[];
}
```

**Métodos:**

| Método | Descripción |
|--------|-------------|
| `update(updates)` | Crea copia actualizada de la entidad |
| `getMetadata()` | Obtiene metadatos básicos para listados |
| `getStats()` | Obtiene estadísticas (jugadores, presupuesto) |
| `isComplete()` | Verifica si tiene ≥11 jugadores en campo |

**Validaciones automáticas:**
- ✅ Nombre requerido y no vacío
- ✅ Formación requerida
- ✅ Presupuesto no negativo
- ✅ Players debe ser array

**Ejemplo de uso:**
```typescript
const entity = new SavedLineupEntity({
  name: 'Mi Alineación',
  formation: formation433,
  team: realMadrid,
  coach: ancelotti,
  budget: 150000000,
  currency: euroCurrency,
  players: [...],
  fieldSlots: new Map(),
  showTeamInLineup: true,
  showCoachInLineup: true,
  playersModified: [],
});

// Validar completitud
if (entity.isComplete()) {
  console.log('Alineación completa');
}

// Obtener stats
const stats = entity.getStats();
console.log(`Presupuesto usado: ${stats.budgetPercentage}%`);
```

---

## 📦 DTOs y Mappers

### DTOs (Data Transfer Objects)

**Ubicación:** `dtos/saved-lineup.dto.ts`

#### SavedLineupDto
DTO completo para persistencia en IndexedDB.

```typescript
interface SavedLineupDto {
  id: string;
  name: string;
  createdAt: string;        // ISO string
  updatedAt: string;        // ISO string
  formation: FormationOption;
  team: TeamSelectOption | null;
  coach: CoachSelectOption | null;
  budget: number;
  currency: CurrencyOption;
  players: LineupPlayer[];
  fieldSlots: Array<[string, FieldSlot]>; // Map serializado
  showTeamInLineup: boolean;
  showCoachInLineup: boolean;
  playersModified: PlayerDto[];
}
```

#### SavedLineupSummaryDto
DTO ligero para listados y previews.

```typescript
interface SavedLineupSummaryDto {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  formation: string;         // Solo label
  teamName: string | null;
  coachName: string | null;
  playersCount: number;
  fieldPlayersCount: number;
  benchPlayersCount: number;
  totalBudget: number;
  spentBudget: number;
  isComplete: boolean;
}
```

#### CreateSavedLineupDto
DTO para crear nueva alineación.

```typescript
interface CreateSavedLineupDto {
  name: string;
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
```

### SavedLineupMapper

Mapper estático para transformaciones entre entidades y DTOs.

**Ubicación:** `mappers/saved-lineup.mapper.ts`

**Métodos:**

| Método | Descripción |
|--------|-------------|
| `entityToDto(entity)` | Entity → DTO completo (para persistencia) |
| `dtoToEntity(dto)` | DTO completo → Entity (para uso en dominio) |
| `entityToSummaryDto(entity)` | Entity → DTO resumen (para listados) |
| `createDtoToEntity(dto)` | CreateDto → Entity (para creación) |
| `applyUpdateToEntity(entity, dto)` | Aplica updates a entity existente |
| `dtosToEntities(dtos)` | Array de DTOs → Array de Entities |
| `entitiesToDtos(entities)` | Array de Entities → Array de DTOs |
| `entitiesToSummaryDtos(entities)` | Array de Entities → Array de Summary DTOs |

**Ejemplo:**
```typescript
// Entity a DTO para guardar
const dto = SavedLineupMapper.entityToDto(entity);

// DTO a Entity para lógica de negocio
const entity = SavedLineupMapper.dtoToEntity(dto);

// Entity a Summary para listado
const summary = SavedLineupMapper.entityToSummaryDto(entity);
```

---

## 🎨 Composables

### useSavedLineupsFeedback

Composable para notificaciones al usuario sobre operaciones con alineaciones.

**Ubicación:** `composables/useSavedLineupsFeedback.ts`

**Métodos:**

```typescript
{
  lineupLoaded(name: string): void;       // Alineación cargada exitosamente
  lineupLoadError(): void;                // Error al cargar
  lineupDeleted(name?: string): void;     // Alineación eliminada
  lineupDeleteError(): void;              // Error al eliminar
  lineupDuplicated(name?: string): void;  // Alineación duplicada
  lineupDuplicateError(): void;           // Error al duplicar
  noLineupsFound(): void;                 // Sin resultados en búsqueda
}
```

**Ejemplo:**
```typescript
const feedback = useSavedLineupsFeedback();

try {
  savedLineupsStore.loadLineup(id);
  feedback.lineupLoaded('Mi Alineación');
} catch (error) {
  feedback.lineupLoadError();
}
```

### useSavedLineupsDialogs

Composable para dialogs de confirmación.

**Ubicación:** `composables/useSavedLineupsDialogs.ts`

**Métodos:**

```typescript
{
  openDeleteConfirmDialog(name: string): DialogChainObject;
  openClearAllConfirmDialog(): DialogChainObject;
}
```

**Ejemplo:**
```typescript
const dialogs = useSavedLineupsDialogs();

dialogs.openDeleteConfirmDialog('Mi Alineación').onOk(() => {
  savedLineupsStore.deleteLineup(id);
  feedback.lineupDeleted('Mi Alineación');
});
```

---

## 🔧 Constantes

### SAVED_LINEUPS_STATE

Estados posibles para operaciones de alineaciones.

**Ubicación:** `constants/savedLineupsState.constant.ts`

```typescript
export const SAVED_LINEUPS_STATE = {
  IDLE: 'idle',       // Sin operación en curso
  LOADING: 'loading', // Operación en proceso
  SUCCESS: 'success', // Operación exitosa
  ERROR: 'error',     // Error en operación
} as const;

export type SavedLineupsStateType = typeof SAVED_LINEUPS_STATE[keyof typeof SAVED_LINEUPS_STATE];
```

**Uso:**
```typescript
import { CONST } from 'src/modules/saved-lineups/constants';

if (saveState.value === CONST.SAVED_LINEUPS_STATE.LOADING) {
  console.log('Guardando...');
}
```

---

## 🎯 Patrones y Convenciones

### 1. Domain-Driven Design (DDD)

- **Entidades** encapsulan lógica de negocio
- **DTOs** para transferencia de datos
- **Mappers** para transformaciones
- **Store** como capa de aplicación

### 2. Barrel Exports

Todos los módulos exportan a través de `index.ts`:

```typescript
// ✅ Correcto
import { SavedLineupCard } from 'src/modules/saved-lineups/components/SavedLineupCard';

// ✅ También correcto (barrel export)
import { useSavedLineupsFeedback } from 'src/modules/saved-lineups/composables';
```

### 3. Naming Conventions

- **Componentes:** PascalCase (`SavedLineupCard`)
- **Composables:** camelCase con prefijo `use` (`useSavedLineupsFeedback`)
- **Stores:** camelCase con prefijo `use` (`useSavedLineupsStore`)
- **Constants:** UPPER_SNAKE_CASE agrupados en objeto (`SAVED_LINEUPS_STATE`)

### 4. Composables Pattern

Siguiendo patrón documentado en `docs/WARP.md`:

```typescript
// Feedback: notificaciones al usuario
const feedback = useSavedLineupsFeedback();
feedback.lineupLoaded('Mi Alineación');

// Dialogs: confirmaciones del usuario
const dialogs = useSavedLineupsDialogs();
dialogs.openDeleteConfirmDialog('Mi Alineación').onOk(() => {
  // Acción confirmada
});
```

### 5. Error Handling

- Store maneja errores internamente
- Actualiza `saveState` y `lastErrorMessage`
- Lanza excepciones para que componentes manejen UI
- Feedback composable para notificaciones consistentes

### 6. Persistencia Automática

- Pinia plugin `persistedState` + `localforage`
- Guarda automáticamente en IndexedDB
- No requiere código de persistencia manual
- Restauración automática al iniciar app

---

## 🔄 Flujos de Usuario

### Flujo 1: Guardar Alineación

```
Usuario en HomePage
  ↓
Ingresa nombre de alineación
  ↓
Click en "Guardar"
  ↓
Helper llama store.saveCurrentLineup()
  ↓
Store valida y crea/actualiza entidad
  ↓
Pinia plugin persiste en IndexedDB
  ↓
Feedback muestra notificación de éxito
```

### Flujo 2: Cargar Alineación

```
Usuario en SavedLineupsPage
  ↓
Click en "Cargar" de una card
  ↓
Navigate a HomePage con query param ?lineup=ID
  ↓
HomePage detecta query param en onMounted
  ↓
Llama store.loadLineup(id)
  ↓
Store restaura estado en useLineupStore
  ↓
Feedback muestra notificación de éxito
  ↓
Usuario ve alineación cargada
```

### Flujo 3: Eliminar Alineación

```
Usuario en SavedLineupsPage
  ↓
Click en "Eliminar" de una card
  ↓
Dialog de confirmación se muestra
  ↓
Usuario confirma
  ↓
Store elimina alineación
  ↓
Pinia plugin actualiza IndexedDB
  ↓
Card desaparece de la lista
  ↓
Feedback muestra notificación de éxito
```

### Flujo 4: Duplicar Alineación

```
Usuario en SavedLineupsPage
  ↓
Click en "Duplicar" de una card
  ↓
Store crea copia con " (Copia)" en nombre
  ↓
Nueva alineación aparece en lista
  ↓
Feedback muestra notificación de éxito
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Guardar alineación desde componente

```vue
<script setup lang="ts">
import { useSavedLineupsStore } from 'stores/useSavedLineupsStore';
import { useLineupStore } from 'stores/useLineupStore';
import { useSavedLineupsFeedback } from 'src/modules/saved-lineups/composables';

const lineupStore = useLineupStore();
const savedLineupsStore = useSavedLineupsStore();
const feedback = useSavedLineupsFeedback();

const handleSave = () => {
  if (!lineupStore.lineupName.trim()) {
    feedback.error('Por favor ingresa un nombre');
    return;
  }

  try {
    const saved = savedLineupsStore.saveCurrentLineup();
    feedback.success(`"${saved.name}" guardada correctamente`);
  } catch (error) {
    console.error('Error al guardar:', error);
    feedback.error('No se pudo guardar la alineación');
  }
};
</script>

<template>
  <q-btn
    label="Guardar"
    color="positive"
    @click="handleSave"
  />
</template>
```

### Ejemplo 2: Listar alineaciones con búsqueda

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useSavedLineupsStore } from 'stores/useSavedLineupsStore';
import { SavedLineupCard } from 'src/modules/saved-lineups/components/SavedLineupCard';

const savedLineupsStore = useSavedLineupsStore();
const { lineupsSortedByDate, hasLineups } = storeToRefs(savedLineupsStore);

const searchTerm = ref('');

const filteredLineups = computed(() => {
  if (!searchTerm.value.trim()) {
    return lineupsSortedByDate.value;
  }
  return savedLineupsStore.searchLineups(searchTerm.value);
});
</script>

<template>
  <div>
    <q-input
      v-model="searchTerm"
      placeholder="Buscar..."
      outlined
    />

    <div v-if="hasLineups" class="grid gap-4">
      <saved-lineup-card
        v-for="lineup in filteredLineups"
        :key="lineup.id"
        :lineup="lineup"
        @load="handleLoad"
        @delete="handleDelete"
        @duplicate="handleDuplicate"
      />
    </div>

    <div v-else>
      No tienes alineaciones guardadas
    </div>
  </div>
</template>
```

### Ejemplo 3: Cargar alineación al montar componente

```vue
<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useSavedLineupsStore } from 'stores/useSavedLineupsStore';
import { useSavedLineupsFeedback } from 'src/modules/saved-lineups/composables';

const route = useRoute();
const savedLineupsStore = useSavedLineupsStore();
const feedback = useSavedLineupsFeedback();

onMounted(() => {
  const lineupId = route.query.lineup;
  
  if (lineupId && typeof lineupId === 'string') {
    try {
      savedLineupsStore.loadLineup(lineupId);
      const lineup = savedLineupsStore.getLineupById(lineupId);
      feedback.lineupLoaded(lineup?.name || 'Alineación');
    } catch (error) {
      console.error('Error al cargar:', error);
      feedback.lineupLoadError();
    }
  }
});
</script>
```

### Ejemplo 4: Eliminar con confirmación

```vue
<script setup lang="ts">
import { useSavedLineupsStore } from 'stores/useSavedLineupsStore';
import {
  useSavedLineupsFeedback,
  useSavedLineupsDialogs,
} from 'src/modules/saved-lineups/composables';

const savedLineupsStore = useSavedLineupsStore();
const feedback = useSavedLineupsFeedback();
const dialogs = useSavedLineupsDialogs();

const handleDelete = (lineupId: string) => {
  const lineup = savedLineupsStore.getLineupById(lineupId);
  
  if (!lineup) {
    feedback.lineupDeleteError();
    return;
  }

  dialogs.openDeleteConfirmDialog(lineup.name).onOk(() => {
    try {
      savedLineupsStore.deleteLineup(lineupId);
      feedback.lineupDeleted(lineup.name);
    } catch (error) {
      console.error('Error al eliminar:', error);
      feedback.lineupDeleteError();
    }
  });
};
</script>
```

---

## 🧪 Testing

### Unit Tests Recomendados

#### SavedLineupEntity

```typescript
describe('SavedLineupEntity', () => {
  it('should validate required fields', () => {
    expect(() => new SavedLineupEntity({ name: '' }))
      .toThrow('El nombre de la alineación es requerido');
  });

  it('should calculate if lineup is complete', () => {
    const entity = new SavedLineupEntity({
      name: 'Test',
      players: [...11Players],
    });
    expect(entity.isComplete()).toBe(true);
  });

  it('should calculate budget percentage', () => {
    const entity = new SavedLineupEntity({
      budget: 100000,
      players: [{ marketValue: 50000 }],
    });
    const stats = entity.getStats();
    expect(stats.budgetPercentage).toBe(50);
  });
});
```

#### SavedLineupMapper

```typescript
describe('SavedLineupMapper', () => {
  it('should convert entity to dto', () => {
    const entity = createTestEntity();
    const dto = SavedLineupMapper.entityToDto(entity);
    
    expect(dto.id).toBe(entity.id);
    expect(dto.name).toBe(entity.name);
    expect(typeof dto.createdAt).toBe('string');
  });

  it('should convert dto to entity', () => {
    const dto = createTestDto();
    const entity = SavedLineupMapper.dtoToEntity(dto);
    
    expect(entity.id).toBe(dto.id);
    expect(entity.createdAt).toBeInstanceOf(Date);
  });
});
```

#### useSavedLineupsStore

```typescript
describe('useSavedLineupsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should save lineup correctly', () => {
    const store = useSavedLineupsStore();
    const lineupStore = useLineupStore();
    
    lineupStore.lineupName = 'Test Lineup';
    store.saveCurrentLineup();
    
    expect(store.totalLineups).toBe(1);
    expect(store.hasLineups).toBe(true);
  });

  it('should load lineup and restore state', () => {
    const store = useSavedLineupsStore();
    const lineupStore = useLineupStore();
    
    // Save first
    lineupStore.lineupName = 'Test';
    const saved = store.saveCurrentLineup();
    
    // Clear lineup store
    lineupStore.lineupName = '';
    
    // Load
    store.loadLineup(saved.id);
    
    expect(lineupStore.lineupName).toBe('Test');
  });

  it('should throw error when loading non-existent lineup', () => {
    const store = useSavedLineupsStore();
    
    expect(() => store.loadLineup('invalid-id'))
      .toThrow('Alineación con ID invalid-id no encontrada');
  });
});
```

---

## 🚀 Mejoras Futuras

### Corto plazo

- [ ] **Export/Import**: Exportar alineaciones como JSON
- [ ] **Ordenamiento**: Permitir ordenar por diferentes criterios
- [ ] **Tags/Categorías**: Etiquetar alineaciones para mejor organización
- [ ] **Favoritos**: Marcar alineaciones como favoritas

### Mediano plazo

- [ ] **Sincronización**: Sync con backend/cloud para multi-dispositivo
- [ ] **Historial de cambios**: Tracking de modificaciones
- [ ] **Comparación**: Comparar dos alineaciones lado a lado
- [ ] **Templates**: Plantillas de alineaciones predefinidas

### Largo plazo

- [ ] **Compartir**: Compartir alineaciones con otros usuarios
- [ ] **Versiones**: Gestión de versiones de alineaciones
- [ ] **Analytics**: Estadísticas de uso de alineaciones
- [ ] **Backup automático**: Sistema de respaldos automáticos

---

## 📚 Referencias

- **Patrones del proyecto**: `docs/WARP.md`
- **Store patterns**: `docs/LINEUP_HELPERS_REFACTOR.md`
- **Pinia documentation**: https://pinia.vuejs.org/
- **Pinia persistedState**: https://github.com/prazdevs/pinia-plugin-persistedstate
- **localforage**: https://localforage.github.io/localForage/

---

## 👥 Contribución

Al trabajar en este módulo, por favor:

1. ✅ Mantén la arquitectura en capas (DDD)
2. ✅ Usa los composables existentes para feedback y dialogs
3. ✅ Sigue las convenciones de naming del proyecto
4. ✅ Actualiza esta documentación si agregas features
5. ✅ Escribe tests para nuevas funcionalidades
6. ✅ Valida que el linting pase antes de commit

---

## 📝 Changelog

### [1.0.0] - 2025-10-07

#### Added
- ✨ Sistema completo de guardado de alineaciones
- ✨ `SavedLineupCard` component con UX mejorada
- ✨ `SavedLineupsPage` con búsqueda y filtrado
- ✨ `useSavedLineupsStore` con todas las operaciones CRUD
- ✨ `SavedLineupEntity` con validaciones y reglas de negocio
- ✨ DTOs y Mappers para transformación de datos
- ✨ Composables para feedback y dialogs
- ✨ Persistencia automática con IndexedDB
- ✨ Constantes para estados de operaciones
- 📚 Documentación completa del módulo

---

**Última actualización:** 7 de octubre de 2025  
**Versión:** 1.0.0  
**Autor:** Golazo Kings Team
