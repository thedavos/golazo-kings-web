import type { useLineupStore } from 'stores/useLineupStore';
import type { useLineupFeedback } from 'src/modules/lineup-builder/composables/useLineupFeedback';

/**
 * Parámetros para el helper de mover jugador a la banca
 */
interface MovePlayerToBenchParams {
  playerId: number;
  lineupStore: ReturnType<typeof useLineupStore>;
  lineupFeedback: ReturnType<typeof useLineupFeedback>;
}

/**
 * Helper para mover jugador del campo a la banca
 *
 * Este helper centraliza la lógica que se usa en:
 * - SoccerField.vue
 *
 * @param params - Parámetros necesarios
 */
export const handleMovePlayerToBench = ({
  playerId,
  lineupStore,
  lineupFeedback,
}: MovePlayerToBenchParams): void => {
  const player = lineupStore.getLineupPlayerById(playerId);
  if (player) {
    lineupStore.moveLineupPlayer(playerId, true); // true = mover a banca
    lineupFeedback.playerMoved(`${player.firstName} ${player.lastName}`.toUpperCase(), true);
  }
};

/**
 * Parámetros para el helper de mover jugador al campo
 */
interface MovePlayerToFieldParams {
  playerId: number;
  lineupStore: ReturnType<typeof useLineupStore>;
  lineupFeedback: ReturnType<typeof useLineupFeedback>;
}

/**
 * Helper para mover jugador de la banca al campo
 *
 * Este helper centraliza la lógica que se usa en:
 * - BenchSlot.vue
 *
 * @param params - Parámetros necesarios
 */
export const handleMovePlayerToField = ({
  playerId,
  lineupStore,
  lineupFeedback,
}: MovePlayerToFieldParams): void => {
  const player = lineupStore.getLineupPlayerById(playerId);
  if (player) {
    lineupStore.moveLineupPlayer(playerId, false); // false = mover a campo
    lineupFeedback.playerMoved(`${player.firstName} ${player.lastName}`.toUpperCase(), false);
  }
};
