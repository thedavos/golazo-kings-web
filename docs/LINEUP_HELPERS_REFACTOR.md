# Refactorización: Sistema de Helpers y Swap Players

Este documento resume las mejoras implementadas en el módulo de lineup-builder para eliminar código duplicado y mejorar el sistema de intercambio de jugadores.

## 📋 Resumen de Cambios

### 1. Implementación de `swapPlayers` en el Store

**Archivo**: `src/stores/useLineupStore.ts`

✅ **Agregado método `swapPlayers(playerId1, playerId2)`**

- Maneja **todos los casos de intercambio**:
  - **Campo ↔ Campo**: Jugadores intercambian posiciones en el campo
  - **Banca ↔ Banca**: Jugadores intercambian posiciones en la banca
  - **Campo ↔ Banca**: Un jugador va al campo y otro a la banca
  - **Con slot vacío**: Compatibilidad para movimientos futuros
- Retorna `boolean` para indicar éxito/fallo
- Mantiene inmutabilidad del estado para reactividad correcta

### 2. Mejoras en Feedback

**Archivo**: `src/modules/lineup-builder/composables/useLineupFeedback.ts`

✅ **Agregados métodos específicos para intercambio**:

```typescript
- playersSwapped(player1Name, player2Name) // Éxito con nombres
- swapError()                               // Error con detalles
```

### 3. Completado el TODO en SoccerField.vue

**Archivo**: `src/modules/lineup-builder/components/SoccerField/SoccerField.vue`

✅ **Implementada lógica de intercambio completa**:
- Reemplazado comentario `// TODO: Implementar lógica de intercambio`
- Usa `lineupStore.swapPlayers()` para realizar el intercambio
- Muestra feedback apropiado según resultado

### 4. Creación del Sistema de Helpers

**Ubicación**: `src/modules/lineup-builder/helpers/`

✅ **Helpers creados** (un archivo por responsabilidad):

#### `swapPlayer.helper.ts`
Maneja el intercambio completo de jugadores incluyendo:
- Apertura del diálogo de selección
- Ejecución del intercambio en el store
- Feedback al usuario (éxito/error)

#### `viewPlayerDetails.helper.ts`
Abre el diálogo para ver detalles completos del jugador.

#### `editPlayerValue.helper.ts`
Abre el diálogo para editar el valor de mercado del jugador.

#### `movePlayer.helper.ts`
Contiene dos funciones:
- `handleMovePlayerToBench` - Mueve del campo a la banca
- `handleMovePlayerToField` - Mueve de la banca al campo

#### `removePlayer.helper.ts`
Remueve jugador completamente de la alineación con feedback.

#### `index.ts`
Barrel export para importaciones centralizadas.

### 5. Refactorización de Componentes

#### **SoccerField.vue**

**Antes**:
- ~75 líneas de código duplicado en handlers
- Lógica de negocio mezclada con componente

**Después**:
- Imports de helpers desde barrel export
- Wrappers locales simples (~5 líneas cada uno)
- Componente enfocado en renderizado
- Código reducido y más legible

#### **BenchSlot.vue**

**Antes**:
- ~75 líneas de código duplicado (idéntico a SoccerField)
- Lógica de negocio mezclada con componente

**Después**:
- Imports de helpers desde barrel export
- Wrappers locales simples (~5 líneas cada uno)
- Componente enfocado en renderizado
- Código reducido y más legible

## 📊 Métricas de Impacto

### Código Eliminado
- **~150 líneas de código duplicado** removidas entre componentes
- **6 funciones** con lógica idéntica consolidadas

### Código Agregado
- **6 archivos helper** con lógica reutilizable
- **1 archivo index** para barrel exports
- **1 método en store** para swap
- **2 métodos en feedback** para swap

### Mejoras en Mantenimiento
- ✅ Cambios futuros solo en un lugar (helper)
- ✅ Tests más fáciles (funciones puras)
- ✅ Menor probabilidad de inconsistencias
- ✅ Mejor separación de responsabilidades

## 🎯 Beneficios Obtenidos

### 1. DRY (Don't Repeat Yourself)
- Código duplicado eliminado completamente
- Una sola fuente de verdad para cada acción

### 2. Mantenibilidad
- Cambios centralizados en helpers
- Componentes más simples y legibles
- Lógica de negocio separada del UI

### 3. Type Safety
- Interfaces tipadas para parámetros
- TypeScript previene errores de uso
- Mejores sugerencias de IDE

### 4. Testabilidad
- Funciones puras más fáciles de testear
- Sin dependencias de componentes Vue
- Mocking más simple de stores/composables

### 5. Consistencia
- Mismo comportamiento en todos los componentes
- Feedback uniforme al usuario
- Patrones predecibles

## 📦 Estructura Final

```
src/modules/lineup-builder/
├── helpers/
│   ├── index.ts                      # Barrel export
│   ├── swapPlayer.helper.ts          # Intercambio de jugadores
│   ├── viewPlayerDetails.helper.ts   # Ver detalles
│   ├── editPlayerValue.helper.ts     # Editar valor
│   ├── movePlayer.helper.ts          # Mover (campo/banca)
│   └── removePlayer.helper.ts        # Remover jugador
├── components/
│   └── SoccerField/
│       ├── SoccerField.vue           # ✨ Refactorizado
│       └── BenchSlot.vue             # ✨ Refactorizado
├── composables/
│   └── useLineupFeedback.ts          # ✨ Mejorado
└── ...
```

## 🔄 Patrón de Uso

### Importación
```typescript
import {
  handleSwapPlayer,
  handleViewPlayerDetails,
  handleEditPlayerValue,
  handleMovePlayerToBench,
  handleMovePlayerToField,
  handleRemovePlayer,
} from 'src/modules/lineup-builder/helpers';
```

### Wrapper Local
```typescript
const onSwapPlayer = (currentPlayerId: number) => {
  handleSwapPlayer({
    currentPlayerId,
    lineupStore,
    lineupDialogs,
    lineupFeedback,
    allPlayersInSlots: allPlayersInSlots.value,
  });
};
```

### Uso en Template
```vue
<player-slot
  @swap-player="onSwapPlayer"
  @view-details="onViewPlayerDetails"
  @edit-value="onEditPlayerValue"
  @move-to-bench="onMovePlayerToBench"
  @remove-player="onRemovePlayer"
/>
```

## 🧪 Casos de Prueba Sugeridos

### Para `swapPlayers` en Store

```typescript
describe('swapPlayers', () => {
  it('should swap two players on field', () => {
    // Setup: dos jugadores en campo
    // Action: swapPlayers(id1, id2)
    // Assert: isBench se mantiene false, orden cambia
  });

  it('should swap two players on bench', () => {
    // Setup: dos jugadores en banca
    // Action: swapPlayers(id1, id2)
    // Assert: isBench se mantiene true, orden cambia
  });

  it('should swap player from field to bench', () => {
    // Setup: uno en campo, uno en banca
    // Action: swapPlayers(fieldId, benchId)
    // Assert: isBench se intercambia correctamente
  });

  it('should return false for invalid player id', () => {
    // Setup: IDs inválidos
    // Action: swapPlayers(999, 1000)
    // Assert: return false
  });
});
```

### Para Helpers

```typescript
describe('handleSwapPlayer', () => {
  it('should open dialog and execute swap on confirmation', () => {
    // Mock: lineupStore, lineupDialogs, lineupFeedback
    // Action: handleSwapPlayer(params)
    // Assert: dialog abierto, swap ejecutado, feedback mostrado
  });

  it('should show error feedback on swap failure', () => {
    // Mock: swapPlayers returns false
    // Action: handleSwapPlayer(params)
    // Assert: swapError() llamado
  });
});
```

## 📚 Documentación Relacionada

- [SWAP_PLAYERS_FEATURE.md](./SWAP_PLAYERS_FEATURE.md) - Documentación detallada del feature
- [WARP.md](../WARP.md) - Guía principal actualizada con helper system
- Store: `src/stores/useLineupStore.ts`
- Composables: `src/modules/lineup-builder/composables/`

## 🚀 Próximos Pasos

### Mejoras Potenciales

1. **Tests Unitarios**
   - Agregar tests para helpers
   - Agregar tests para `swapPlayers` en store
   - Coverage objetivo: 80%+

2. **Validaciones Adicionales**
   - Validar formaciones antes de swap
   - Prevenir swaps que violen reglas de formación
   - Límites de jugadores por posición

3. **Optimizaciones**
   - Memoización de cálculos costosos
   - Debounce para operaciones frecuentes
   - Virtual scrolling para listas largas

4. **Nuevos Helpers**
   - `handleBatchSwap` - Swap múltiple
   - `handleAutoPosition` - Posicionamiento automático
   - `handleValidateFormation` - Validación de formación

## ✅ Checklist de Completitud

- [x] Implementado `swapPlayers` en store
- [x] Agregados métodos de feedback específicos
- [x] Completado TODO en SoccerField.vue
- [x] Creados 6 helpers con responsabilidad única
- [x] Refactorizado SoccerField.vue
- [x] Refactorizado BenchSlot.vue
- [x] Creado barrel export (index.ts)
- [x] Actualizado WARP.md
- [x] Documentado feature en SWAP_PLAYERS_FEATURE.md
- [x] Documentado refactorización en este archivo

## 🎉 Conclusión

Esta refactorización representa una mejora significativa en la calidad del código:

- **Mantenibilidad**: Código más fácil de mantener y extender
- **Legibilidad**: Componentes más simples y enfocados
- **Reutilización**: Lógica centralizada y reutilizable
- **Consistencia**: Comportamiento uniforme entre componentes
- **Calidad**: Mejor estructura y separación de responsabilidades

El patrón de helpers establecido puede replicarse en otros módulos para obtener beneficios similares.

---

**Fecha de Implementación**: Octubre 2025  
**Módulos Afectados**: lineup-builder  
**Breaking Changes**: Ninguno (refactorización interna)
