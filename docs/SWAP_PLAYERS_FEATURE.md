# Función `swapPlayers` - Documentación y Ejemplos

## Descripción
La función `swapPlayers` del store `useLineupStore` permite intercambiar dos jugadores de posición en la alineación. Es versátil y maneja todos los casos posibles de intercambio.

## Firma
```typescript
swapPlayers(playerId1: number | string, playerId2: number | string | null): boolean
```

## Casos de Uso

### 1. Campo ↔ Campo
Intercambia dos jugadores que están en el campo. Ambos mantienen su estado `isBench: false` pero intercambian sus posiciones físicas en el campo.

```typescript
// Ejemplo: Intercambiar delantero con mediocampista
const success = lineupStore.swapPlayers(playerId1, playerId2);
// Resultado: Jugador 1 toma el slot de Jugador 2 y viceversa
// Ambos siguen en el campo (isBench = false)
```

**Escenario real:**
- Jugador 1: Delantero en posición DEL (isBench: false)
- Jugador 2: Mediocampista en posición MED (isBench: false)
- Después del intercambio:
  - Jugador 1: Ahora en posición MED (isBench: false)
  - Jugador 2: Ahora en posición DEL (isBench: false)

### 2. Banca ↔ Banca
Intercambia dos jugadores que están en la banca. Ambos mantienen su estado `isBench: true` pero cambian de posición dentro de la banca.

```typescript
// Ejemplo: Reorganizar jugadores en la banca
const success = lineupStore.swapPlayers(benchPlayerId1, benchPlayerId2);
// Resultado: Jugador 1 toma la posición de Jugador 2 en la banca y viceversa
// Ambos siguen en la banca (isBench = true)
```

**Escenario real:**
- Jugador 1: En banca posición 1 (isBench: true)
- Jugador 2: En banca posición 3 (isBench: true)
- Después del intercambio:
  - Jugador 1: Ahora en banca posición 3 (isBench: true)
  - Jugador 2: Ahora en banca posición 1 (isBench: true)

### 3. Campo ↔ Banca
Intercambia un jugador del campo con uno de la banca. Cambian tanto de ubicación como de estado `isBench`.

```typescript
// Ejemplo: Sustituir jugador titular con suplente
const success = lineupStore.swapPlayers(fieldPlayerId, benchPlayerId);
// Resultado: 
// - Jugador de campo va a la banca (isBench cambia a true)
// - Jugador de banca va al campo (isBench cambia a false)
```

**Escenario real:**
- Jugador 1: Defensa en el campo (isBench: false)
- Jugador 2: En la banca (isBench: true)
- Después del intercambio:
  - Jugador 1: Ahora en la banca (isBench: true)
  - Jugador 2: Ahora jugando como Defensa (isBench: false)

### 4. Con Slot Vacío
Mueve un jugador a un slot vacío (cuando `playerId2` es `null`).

```typescript
// Ejemplo: Mover jugador a posición vacía
const success = lineupStore.swapPlayers(playerId1, null);
// Resultado: El jugador se mantiene en su ubicación actual
// (Este caso es para compatibilidad futura)
```

## Retorno
- `true`: El intercambio se realizó exitosamente
- `false`: El intercambio falló (jugador no encontrado, índice inválido, etc.)

## Implementación Interna

La función funciona intercambiando **completamente** los jugadores en sus posiciones del array:

1. **Campo a Campo**: Los jugadores intercambian sus índices en el array de `lineupPlayers`, lo que resulta en un cambio de slots en el campo. Mantienen `isBench: false`
2. **Banca a Banca**: Los jugadores intercambian sus índices en el array, lo que cambia su orden en la banca. Mantienen `isBench: true`
3. **Campo a Banca**: Los jugadores intercambian tanto sus posiciones en el array como sus estados `isBench`. El de campo obtiene `true` (va a banca) y el de banca obtiene `false` (va a campo)

**Clave del Diseño**: 
- El computed `fieldPlayersInSlots` asigna jugadores a slots basado en el **orden del array**
- Por eso es crucial intercambiar las posiciones completas de los jugadores en el array, no solo el estado `isBench`
- Esto garantiza que los jugadores realmente cambien de slot/posición visual

## Código de Implementación

```typescript
const swapPlayers = (
  playerId1: number | string,
  playerId2: number | string | null,
): boolean => {
  // Buscar el jugador 1
  const lineupPlayer1 = lineupPlayers.value.find((lp) => lp.player.id === playerId1);
  if (!lineupPlayer1) return false;

  const index1 = lineupPlayers.value.indexOf(lineupPlayer1);
  if (index1 === -1) return false;

  // Caso 1: Intercambio con slot vacío (playerId2 es null)
  if (playerId2 === null) {
    return true;
  }

  // Caso 2: Intercambio entre dos jugadores
  const lineupPlayer2 = lineupPlayers.value.find((lp) => lp.player.id === playerId2);
  if (!lineupPlayer2) return false;

  const index2 = lineupPlayers.value.indexOf(lineupPlayer2);
  if (index2 === -1) return false;

  // Crear nuevo array para mantener inmutabilidad
  const newLineupPlayers = [...lineupPlayers.value];

  // Obtener el estado isBench de cada jugador
  const player1IsBench = lineupPlayer1.isBench;
  const player2IsBench = lineupPlayer2.isBench;

  // IMPORTANTE: Intercambiar completamente los jugadores en sus posiciones
  // Esto asegura que:
  // - Campo ↔ Campo: Los jugadores intercambian sus índices en el array (slots)
  // - Banca ↔ Banca: Los jugadores intercambian sus índices en el array (posiciones)
  // - Campo ↔ Banca: Los jugadores intercambian tanto posición como estado isBench
  newLineupPlayers[index1] = {
    ...lineupPlayer2,
    isBench: player1IsBench,
  };
  newLineupPlayers[index2] = {
    ...lineupPlayer1,
    isBench: player2IsBench,
  };

  lineupPlayers.value = newLineupPlayers;
  return true;
};
```

## Reactividad

La función mantiene la inmutabilidad creando un nuevo array de `lineupPlayers`, lo que garantiza que Vue detecte los cambios y actualice la UI automáticamente.

## Uso en Componentes

### Ejemplo en SoccerField.vue
```typescript
const handleSwapPlayer = (currentPlayerId: number) => {
  const currentPlayer = lineupStore.getLineupPlayerById(currentPlayerId);
  if (!currentPlayer) return;

  const currentSlot = fieldPlayersInSlots.value.find((s) => s.playerId === currentPlayerId);

  lineupDialogs
    .openSwapPlayerDialog(currentPlayer, currentSlot, allPlayersInSlots.value)
    .onOk((payload: { targetPlayerId: number | null }) => {
      if (payload.targetPlayerId) {
        const targetPlayer = lineupStore.getLineupPlayerById(payload.targetPlayerId);
        if (targetPlayer) {
          const success = lineupStore.swapPlayers(currentPlayerId, payload.targetPlayerId);

          if (success) {
            const player1Name = `${currentPlayer.firstName} ${currentPlayer.lastName}`;
            const player2Name = `${targetPlayer.firstName} ${targetPlayer.lastName}`;
            lineupFeedback.playersSwapped(player1Name, player2Name);
          } else {
            lineupFeedback.swapError();
          }
        }
      }
    });
};
```

## Feedback al Usuario

Se agregaron funciones específicas en `useLineupFeedback.ts`:

```typescript
/**
 * Feedback para cuando se intercambian dos jugadores
 */
const playersSwapped = (player1Name: string, player2Name: string) => {
  feedback.success({
    message: `Intercambio exitoso: ${player1Name} ↔ ${player2Name}`,
    icon: 'la la-exchange-alt',
    timeout: 2500,
  });
};

/**
 * Feedback para cuando falla el intercambio de jugadores
 */
const swapError = () => {
  feedback.error({
    message: 'No se pudo realizar el intercambio',
    caption: 'Verifica que ambos jugadores estén en la alineación',
    icon: 'la la-exclamation-circle',
    timeout: 3000,
  });
};
```

## Ventajas del Diseño

1. **Simplicidad**: Una sola función maneja todos los casos de intercambio
2. **Flexibilidad**: Funciona con campo, banca y combinaciones
3. **Reactivo**: Los cambios se reflejan automáticamente en la UI
4. **Seguro**: Valida que los jugadores existan antes de intercambiar
5. **Inmutable**: Crea nuevos arrays en lugar de mutar el estado
6. **Feedback claro**: Mensajes específicos para éxito y error

## Testing Sugerido

Para probar la función:

```typescript
// Setup
const lineupStore = useLineupStore();
lineupStore.addLineupPlayer(player1, false); // Campo
lineupStore.addLineupPlayer(player2, false); // Campo
lineupStore.addLineupPlayer(player3, true);  // Banca
lineupStore.addLineupPlayer(player4, true);  // Banca

// Test: Campo a Campo
const result1 = lineupStore.swapPlayers(player1.id, player2.id);
expect(result1).toBe(true);
expect(lineupStore.getLineupPlayerById(player1.id)?.isBench).toBe(false);
expect(lineupStore.getLineupPlayerById(player2.id)?.isBench).toBe(false);

// Test: Banca a Banca
const result2 = lineupStore.swapPlayers(player3.id, player4.id);
expect(result2).toBe(true);
expect(lineupStore.getLineupPlayerById(player3.id)?.isBench).toBe(true);
expect(lineupStore.getLineupPlayerById(player4.id)?.isBench).toBe(true);

// Test: Campo a Banca
const result3 = lineupStore.swapPlayers(player1.id, player3.id);
expect(result3).toBe(true);
expect(lineupStore.getLineupPlayerById(player1.id)?.isBench).toBe(true);
expect(lineupStore.getLineupPlayerById(player3.id)?.isBench).toBe(false);

// Test: Con ID inválido
const result4 = lineupStore.swapPlayers(999, player1.id);
expect(result4).toBe(false);

// Test: Con null (slot vacío)
const result5 = lineupStore.swapPlayers(player1.id, null);
expect(result5).toBe(true);
```

## Archivos Modificados

1. **`src/stores/useLineupStore.ts`**
   - Agregada función `swapPlayers`
   - Exportada en el return del store

2. **`src/modules/lineup-builder/components/SoccerField/SoccerField.vue`**
   - Implementada lógica en `handleSwapPlayer`
   - Reemplazado TODO con código funcional

3. **`src/modules/lineup-builder/composables/useLineupFeedback.ts`**
   - Agregada función `playersSwapped`
   - Agregada función `swapError`
   - Exportadas ambas funciones

## Notas Técnicas

- La función no modifica las posiciones exactas (coordenadas x, y) de los jugadores en el campo
- El sistema de slots asigna automáticamente las posiciones basándose en el estado `isBench`
- Los jugadores intercambiados mantienen sus datos personales (nombre, valor, etc.)
- Solo se intercambia su ubicación (campo vs banca)
