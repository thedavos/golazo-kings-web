# Feature: Intercambio con Slots Vacíos del Campo

## 📋 Descripción

Mejora al diálogo de intercambio de jugadores (`SwapPlayerDialog`) para permitir seleccionar posiciones vacías del campo como destino del intercambio.

## 🎯 Objetivo

Permitir a los usuarios mover jugadores a slots vacíos del campo sin necesidad de tener otro jugador en esa posición. Esto facilita la reorganización de la alineación cuando hay espacios disponibles.

## ✨ Comportamiento Anterior

**Antes:**
- Solo se podían intercambiar jugadores con otros jugadores
- Los slots vacíos del campo NO eran seleccionables
- Para mover un jugador de banca a una posición vacía del campo, se requería usar "Mover al campo"

## ✨ Comportamiento Nuevo

**Ahora:**
- Se pueden intercambiar jugadores con otros jugadores (igual que antes)
- **NUEVO**: Se pueden seleccionar slots vacíos del campo como destino
- **RESTRICCIÓN**: Solo slots del campo, NO se muestran slots vacíos de la banca
- Visual distintivo para slots vacíos (borde punteado, icono diferente)

## 🖼️ Interfaz de Usuario

### Slots Vacíos del Campo

Los slots vacíos se muestran con:

1. **Avatar con icono de "+"**: `la la-plus-circle` en fondo gris claro
2. **Texto**: "Posición vacía" en color gris
3. **Badge**: Muestra la posición (DEL, MED, DEF, POR) en color gris
4. **Etiqueta**: "(Disponible)" para indicar que está libre
5. **Borde punteado**: Diferencia visual clara de slots ocupados

### Ejemplo Visual

```
┌─────────────────────────────────┐
│ [+]  Posición vacía             │
│      [DEL] Campo (Disponible)   │
└─────────────────────────────────┘
      ↑ Borde punteado
```

vs

```
┌─────────────────────────────────┐
│ [👤] Lionel Messi               │
│      [DEL] Campo                │
└─────────────────────────────────┘
      ↑ Borde sólido
```

## 🔧 Implementación Técnica

### 1. Nuevo Método en el Store

**Archivo**: `src/stores/useLineupStore.ts`

#### Método `movePlayerToSlot`

```typescript
const movePlayerToSlot = (playerId: number | string, targetSlotId: string): boolean => {
  // Buscar el índice del slot destino en la formación PRIMERO
  const formationKey = formation.value.value === 'Personalizado' ? '3-2-1' : formation.value.value;
  const formationConfiguration = CONST.FORMATION.FORMATION_CONFIGURATION[formationKey];
  const targetSlotIndex = formationConfiguration.findIndex((pos) => pos.id === targetSlotId);

  if (targetSlotIndex === -1) return false;

  // Buscar el jugador en la alineación
  let lineupPlayer = lineupPlayers.value.find((lp) => lp.player.id === playerId);
  if (!lineupPlayer) return false;

  // Si el jugador está en la banca, primero moverlo al campo
  if (lineupPlayer.isBench) {
    moveLineupPlayer(playerId, false);
    
    // ⚠️ CRÍTICO: Buscar de nuevo el jugador después de moverlo
    // ya que moveLineupPlayer modifica lineupPlayers.value
    lineupPlayer = lineupPlayers.value.find((lp) => lp.player.id === playerId);
    if (!lineupPlayer || lineupPlayer.isBench) return false;
  }

  // Obtener todos los jugadores del campo (sin el jugador actual)
  const fieldPlayersWithoutCurrent = lineupPlayers.value.filter(
    (lp) => !lp.isBench && lp.player.id !== playerId,
  );

  // Obtener todos los jugadores de la banca
  const benchPlayersOnly = lineupPlayers.value.filter((lp) => lp.isBench);

  // Validar que el targetSlotIndex no exceda el número de slots disponibles
  // Si hay menos jugadores que slots, ajustar el índice
  const actualTargetIndex = Math.min(targetSlotIndex, fieldPlayersWithoutCurrent.length);

  // Insertar el jugador en la posición del actualTargetIndex
  const newFieldPlayers = [
    ...fieldPlayersWithoutCurrent.slice(0, actualTargetIndex),
    lineupPlayer,
    ...fieldPlayersWithoutCurrent.slice(actualTargetIndex),
  ];

  // Reconstruir el array completo: jugadores del campo + jugadores de la banca
  lineupPlayers.value = [...newFieldPlayers, ...benchPlayersOnly];

  return true;
};
```

**Cómo funciona:**
1. ✅ Valida el slot destino PRIMERO (fail-fast)
2. ✅ Encuentra el jugador en `lineupPlayers` (usando `let` para reasignación)
3. ✅ Si está en banca, lo mueve al campo Y lo re-busca (crítico para evitar referencia obsoleta)
4. ✅ Remueve el jugador del array
5. ✅ Valida límites del índice con `Math.min`
6. ✅ Lo inserta en la posición correspondiente al slot destino
7. ✅ Mantiene los jugadores de banca al final del array

**Mejoras implementadas:**
- Usa `let` en lugar de `const` para permitir reasignación
- Re-busca jugador después de `moveLineupPlayer()` para evitar referencia obsoleta
- Valida slot antes de buscar jugador (mejor performance)
- Valida límites con `actualTargetIndex` para evitar índices inválidos

### 2. Modificación del Diálogo

**Archivo**: `src/modules/lineup-builder/dialogs/SwapPlayerDialog/SwapPlayerDialog.vue`

#### Computed `availablePlayers` Actualizado

```typescript
const availablePlayers = computed(() => {
  return props.availableSlots.filter((slot) => {
    // Excluir el jugador actual
    if (slot.playerId === props.currentPlayer?.id) {
      return false;
    }

    // Incluir jugadores (campo o banca con jugador)
    if (slot.playerId !== null) {
      return true;
    }

    // ✨ NUEVO: Incluir slots vacíos SOLO del campo (no de la banca)
    return !slot.isBench;
  });
});
```

#### Template Actualizado

**Cambios clave:**
- Avatar dinámico: muestra foto, icono de usuario, o icono de "+" según el caso
- Texto dinámico: nombre del jugador o "Posición vacía"
- Badge con color diferente para slots vacíos (gris vs azul)
- Clase CSS `border-dashed` para slots vacíos
- Handler actualizado para pasar tanto `targetPlayerId` como `targetSlotId`

### 2. Modificación del Helper

**Archivo**: `src/modules/lineup-builder/helpers/swapPlayer.helper.ts`

#### Lógica de Manejo

```typescript
.onOk((payload: { targetPlayerId: number | null; targetSlotId?: string }) => {
  // Caso 1: Intercambio con otro jugador
  if (payload.targetPlayerId) {
    const success = lineupStore.swapPlayers(currentPlayerId, payload.targetPlayerId);
    if (success) {
      lineupFeedback.playersSwapped(player1Name, player2Name);
    }
  }
  
  // Caso 2: ✨ NUEVO - Mover a slot vacío del campo
  else if (payload.targetSlotId) {
    // Mover el jugador al slot específico usando movePlayerToSlot
    const success = lineupStore.movePlayerToSlot(currentPlayerId, payload.targetSlotId);

    if (success) {
      const playerName = `${currentPlayer.firstName} ${currentPlayer.lastName}`;
      lineupFeedback.success(`${playerName} movido a nueva posición`);
    } else {
      lineupFeedback.error('No se pudo mover el jugador');
    }
  }
});
```

## 📊 Casos de Uso

### Caso 1: Jugador de Banca → Slot Vacío del Campo

**Estado Inicial:**
- Jugador A: En banca
- Slot DEL: Vacío (campo)

**Acción:**
1. Click derecho en Jugador A → "Intercambiar"
2. Seleccionar "Posición vacía - DEL"

**Resultado:**
- Jugador A: Ahora en el campo (slot DEL)
- Feedback: "JUGADOR A movido a el campo"

### Caso 2: Jugador del Campo → Slot Vacío del Campo

**Estado Inicial:**
- Jugador B: En campo (slot PO - Portero)
- Slot DC: Vacío (Defensa Central)

**Acción:**
1. Click derecho en Jugador B → "Intercambiar"
2. Seleccionar "Posición vacía - DC"

**Resultado:**
- Jugador B: Ahora en slot DC (Defensa Central)
- El slot PO queda vacío
- Feedback: "JUGADOR B movido a nueva posición"
- **Método usado**: `movePlayerToSlot()` que reordena el array

### Caso 3: Jugador del Campo → Otro Jugador

**Estado Inicial:**
- Jugador C: En campo (slot DEL)
- Jugador D: En campo (slot MED)

**Acción:**
1. Click derecho en Jugador C → "Intercambiar"
2. Seleccionar "Jugador D - MED"

**Resultado:**
- Jugador C: Ahora en slot MED
- Jugador D: Ahora en slot DEL
- Feedback: "Intercambio exitoso: JUGADOR C ↔ JUGADOR D"

## 🚫 Restricciones

### Slots de Banca NO Incluidos

**Por qué:**
- Los slots de banca no tienen "posiciones" específicas como el campo
- Mover a la banca ya tiene un botón dedicado ("Mover a banca")
- Evita confusión en la UI

**Comportamiento:**
```typescript
// Slots vacíos de banca NO se muestran
return !slot.isBench; // Solo campo
```

## 🎨 Estilos CSS

```css
.border-dashed {
  border-style: dashed !important;
  border-width: 2px !important;
}
```

Aplicado solo a slots vacíos mediante:
```vue
:class="{ 'border-dashed': slot.playerId === null }"
```

## 🧪 Testing Sugerido

### Test 1: Slots Vacíos del Campo Visibles
```typescript
it('should show empty field slots in swap dialog', () => {
  // Setup: Campo con slots vacíos
  // Action: Abrir dialog de intercambio
  // Assert: Slots vacíos visibles con borde punteado
});
```

### Test 2: Slots Vacíos de Banca NO Visibles
```typescript
it('should NOT show empty bench slots in swap dialog', () => {
  // Setup: Banca con slots vacíos
  // Action: Abrir dialog de intercambio
  // Assert: Slots vacíos de banca NO aparecen
});
```

### Test 3: Mover de Banca a Slot Vacío
```typescript
it('should move bench player to empty field slot', () => {
  // Setup: Jugador en banca, slot DEL vacío
  // Action: Seleccionar slot vacío
  // Assert: Jugador movido al campo
});
```

### Test 4: Jugador en Campo Selecciona Slot Vacío
```typescript
it('should show message when field player selects empty slot', () => {
  // Setup: Jugador en campo
  // Action: Seleccionar slot vacío del campo
  // Assert: Mensaje "Jugador ya está en el campo"
});
```

## 🔄 Flujo de Datos

```
Usuario Click → SwapPlayerDialog
                      ↓
           Lista slots disponibles:
           - Jugadores (todos)
           - Slots vacíos (solo campo)
                      ↓
           Usuario selecciona slot
                      ↓
      ┌───────────────┴───────────────┐
      ↓                               ↓
  targetPlayerId != null      targetSlotId != null
  (intercambiar jugadores)    (mover a vacío)
      ↓                               ↓
  swapPlayers()               moveLineupPlayer()
      ↓                               ↓
  playersSwapped()            playerMoved()
```

## 📝 Mejoras Futuras

### 1. Intercambio de Posición Exacta
Actualmente, al seleccionar un slot vacío del campo, el jugador se mueve al campo pero el sistema decide la posición exacta.

**Mejora:**
- Implementar lógica para asignar al jugador exactamente al slot seleccionado
- Requiere tracking más preciso de posiciones en el store

### 2. Drag & Drop desde Diálogo
Permitir arrastrar jugadores a slots desde el diálogo.

### 3. Vista Previa
Mostrar mini-campo con preview del cambio antes de confirmar.

### 4. Animaciones
Transiciones suaves cuando se mueve un jugador a un slot vacío.

## ✅ Checklist

- [x] Modificado `availablePlayers` computed para incluir slots vacíos del campo
- [x] Actualizado template con UI para slots vacíos
- [x] Agregado estilo CSS `border-dashed`
- [x] Actualizado helper para manejar `targetSlotId`
- [x] Documentado feature completo
- [x] Casos de uso documentados
- [ ] Tests unitarios implementados (pendiente)
- [ ] Testing manual completado (pendiente)

## 🎯 Impacto

**UX:**
- ✅ Más flexible y intuitivo
- ✅ Menos clicks para reorganizar alineación
- ✅ Visual claro de slots disponibles

**Técnico:**
- ✅ Código limpio y bien documentado
- ✅ Reutiliza funcionalidad existente del store
- ✅ Mantiene separación de responsabilidades

---

**Feature Date**: Octubre 2025  
**Impact**: Medium - Mejora significativa en UX de gestión de alineación  
**Breaking Changes**: Ninguno (extensión de funcionalidad existente)
