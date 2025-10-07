# Bug Fix: swapPlayers entre jugadores de campo

## 🐛 Problema Identificado

### Síntoma
Cuando se intentaba intercambiar dos jugadores que estaban en el campo (ambos con `isBench: false`), los jugadores **no cambiaban de slot visualmente**.

### Comportamiento Esperado
- Jugador A en slot DEL → debería ir a slot MED
- Jugador B en slot MED → debería ir a slot DEL

### Comportamiento Real
- Jugador A permanecía en slot DEL
- Jugador B permanecía en slot MED
- No había cambio visual

## 🔍 Análisis de la Causa

### Implementación Original (Incorrecta)

```typescript
// ❌ INCORRECTO
const swapPlayers = (playerId1, playerId2) => {
  // ...
  const player1IsBench = lineupPlayer1.isBench;
  const player2IsBench = lineupPlayer2.isBench;

  // Solo intercambiaba el estado isBench
  newLineupPlayers[index1] = {
    ...lineupPlayer1,  // ❌ Mantiene el mismo jugador
    isBench: player2IsBench,
  };
  newLineupPlayers[index2] = {
    ...lineupPlayer2,  // ❌ Mantiene el mismo jugador
    isBench: player1IsBench,
  };
  
  lineupPlayers.value = newLineupPlayers;
};
```

### Por Qué No Funcionaba

El computed `fieldPlayersInSlots` asigna jugadores a slots basándose en el **orden del array `lineupPlayers`**:

```typescript
const fieldPlayersInSlots = computed(() => {
  // ...
  fieldPlayers.value.forEach((lineupPlayer) => {
    // Asigna al primer slot disponible
    const matchingSlot = emptySlots.find(slot => !slotAssignments.has(slot.id));
    if (matchingSlot) {
      slotAssignments.set(matchingSlot.id, lineupPlayer);
    }
  });
});
```

**El problema:**
1. Cuando dos jugadores están en campo (`isBench: false`), el código original solo intercambiaba el estado `isBench`
2. Como ambos ya tenían `isBench: false`, intercambiar `false` por `false` no hacía nada
3. Los jugadores se mantenían en sus mismas posiciones del array
4. Por lo tanto, `fieldPlayersInSlots` los asignaba a los mismos slots

## ✅ Solución Implementada

### Código Corregido

```typescript
// ✅ CORRECTO
const swapPlayers = (playerId1, playerId2) => {
  // ...
  const player1IsBench = lineupPlayer1.isBench;
  const player2IsBench = lineupPlayer2.isBench;

  // Intercambia COMPLETAMENTE los jugadores en sus posiciones
  newLineupPlayers[index1] = {
    ...lineupPlayer2,      // ✅ Pone jugador2 en posición de jugador1
    isBench: player1IsBench,
  };
  newLineupPlayers[index2] = {
    ...lineupPlayer1,      // ✅ Pone jugador1 en posición de jugador2
    isBench: player2IsBench,
  };
  
  lineupPlayers.value = newLineupPlayers;
};
```

### Por Qué Funciona Ahora

1. **Campo ↔ Campo** (ambos `isBench: false`):
   - Jugador1 en índice 0 → Jugador2 ahora en índice 0
   - Jugador2 en índice 3 → Jugador1 ahora en índice 3
   - Resultado: Los jugadores **intercambian sus índices** en el array
   - `fieldPlayersInSlots` ahora los asigna a slots diferentes

2. **Banca ↔ Banca** (ambos `isBench: true`):
   - Similar al caso anterior, intercambian sus índices
   - Resultado: Cambian de posición en la banca

3. **Campo ↔ Banca** (uno `false`, otro `true`):
   - Jugador1 de campo → Jugador2 toma su posición con `isBench: false`
   - Jugador2 de banca → Jugador1 toma su posición con `isBench: true`
   - Resultado: Intercambian tanto índice como estado

## 📊 Comparación Antes/Después

### Estado Inicial
```
lineupPlayers = [
  { player: { id: 1, name: "Messi" }, isBench: false },    // índice 0
  { player: { id: 2, name: "CR7" }, isBench: false },      // índice 1
  { player: { id: 3, name: "Neymar" }, isBench: false },   // índice 2
]
```

### Después de swapPlayers(1, 3) - Versión INCORRECTA
```
lineupPlayers = [
  { player: { id: 1, name: "Messi" }, isBench: false },    // índice 0 ❌ No cambió
  { player: { id: 2, name: "CR7" }, isBench: false },      // índice 1
  { player: { id: 3, name: "Neymar" }, isBench: false },   // índice 2 ❌ No cambió
]
```
**Resultado**: Sin cambios visuales

### Después de swapPlayers(1, 3) - Versión CORRECTA
```
lineupPlayers = [
  { player: { id: 3, name: "Neymar" }, isBench: false },   // índice 0 ✅ Neymar
  { player: { id: 2, name: "CR7" }, isBench: false },      // índice 1
  { player: { id: 1, name: "Messi" }, isBench: false },    // índice 2 ✅ Messi
]
```
**Resultado**: Messi y Neymar intercambian slots visualmente

## 🧪 Casos de Prueba

### Test 1: Campo ↔ Campo
```typescript
it('should swap two players on field and change their visual slots', () => {
  // Setup
  const player1 = { id: 1, name: 'A' };
  const player2 = { id: 2, name: 'B' };
  lineupStore.addLineupPlayer(player1, false); // índice 0
  lineupStore.addLineupPlayer(player2, false); // índice 1
  
  // Action
  const result = lineupStore.swapPlayers(1, 2);
  
  // Assert
  expect(result).toBe(true);
  expect(lineupStore.lineupPlayers[0].player.id).toBe(2); // B en posición de A
  expect(lineupStore.lineupPlayers[1].player.id).toBe(1); // A en posición de B
  expect(lineupStore.lineupPlayers[0].isBench).toBe(false);
  expect(lineupStore.lineupPlayers[1].isBench).toBe(false);
});
```

### Test 2: Banca ↔ Banca
```typescript
it('should swap two players on bench and change their order', () => {
  // Setup
  const player1 = { id: 1, name: 'A' };
  const player2 = { id: 2, name: 'B' };
  lineupStore.addLineupPlayer(player1, true); // índice 0, banca
  lineupStore.addLineupPlayer(player2, true); // índice 1, banca
  
  // Action
  const result = lineupStore.swapPlayers(1, 2);
  
  // Assert
  expect(result).toBe(true);
  expect(lineupStore.lineupPlayers[0].player.id).toBe(2);
  expect(lineupStore.lineupPlayers[1].player.id).toBe(1);
  expect(lineupStore.lineupPlayers[0].isBench).toBe(true);
  expect(lineupStore.lineupPlayers[1].isBench).toBe(true);
});
```

### Test 3: Campo ↔ Banca
```typescript
it('should swap player from field to bench', () => {
  // Setup
  const fieldPlayer = { id: 1, name: 'Field' };
  const benchPlayer = { id: 2, name: 'Bench' };
  lineupStore.addLineupPlayer(fieldPlayer, false); // índice 0
  lineupStore.addLineupPlayer(benchPlayer, true);  // índice 1
  
  // Action
  const result = lineupStore.swapPlayers(1, 2);
  
  // Assert
  expect(result).toBe(true);
  expect(lineupStore.lineupPlayers[0].player.id).toBe(2); // Bench player
  expect(lineupStore.lineupPlayers[0].isBench).toBe(false); // Ahora en campo
  expect(lineupStore.lineupPlayers[1].player.id).toBe(1); // Field player
  expect(lineupStore.lineupPlayers[1].isBench).toBe(true); // Ahora en banca
});
```

## 🎯 Lecciones Aprendidas

1. **Entender el flujo de datos**: Es crucial entender cómo los computed properties derivan el estado
2. **Orden del array importa**: Cuando el orden determina la presentación visual, intercambiar solo propiedades no es suficiente
3. **Testing es esencial**: Tests habrían detectado este bug inmediatamente
4. **Documentar supuestos**: El código original asumía que cambiar `isBench` era suficiente, pero no documentaba cómo se asignaban los slots

## 📝 Checklist de Verificación

- [x] Bug identificado y documentado
- [x] Causa raíz analizada
- [x] Solución implementada
- [x] Documentación actualizada (SWAP_PLAYERS_FEATURE.md)
- [x] Tests sugeridos documentados
- [ ] Tests implementados (pendiente)
- [ ] Casos edge probados manualmente

## 🚀 Próximos Pasos

1. Implementar tests unitarios para verificar el fix
2. Agregar tests de integración para verificar comportamiento visual
3. Considerar agregar validación de índices para prevenir bugs similares
4. Evaluar si otros métodos del store tienen problemas similares

---

**Bug Fix Date**: Octubre 2025  
**Severity**: Medium (afecta funcionalidad principal pero no rompe la app)  
**Impact**: Mejora significativa en UX de intercambio de jugadores
