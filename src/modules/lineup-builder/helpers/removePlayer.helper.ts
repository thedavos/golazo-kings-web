import type { useLineupStore } from 'stores/useLineupStore';
import type { useLineupFeedback } from 'src/modules/lineup-builder/composables/useLineupFeedback';

/**
 * Parámetros para el helper de remover jugador
 */
interface RemovePlayerParams {
  playerId: number;
  lineupStore: ReturnType<typeof useLineupStore>;
  lineupFeedback: ReturnType<typeof useLineupFeedback>;
}

/**
 * Helper para remover jugador de la alineación
 * Elimina el jugador del lineup y muestra feedback al usuario
 *
 * Este helper centraliza la lógica que se usa en:
 * - SoccerField.vue
 * - BenchSlot.vue
 *
 * @param params - Parámetros necesarios
 */
export const handleRemovePlayer = ({
  playerId,
  lineupStore,
  lineupFeedback,
}: RemovePlayerParams): void => {
  const player = lineupStore.getLineupPlayerById(playerId);
  if (player) {
    lineupStore.removeLineupPlayer(playerId);
    lineupFeedback.playerRemoved(`${player.firstName} ${player.lastName}`.toUpperCase());
  }
};
