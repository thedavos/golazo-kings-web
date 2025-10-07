import type { useLineupStore } from 'stores/useLineupStore';
import type { useLineupDialogs } from 'src/modules/lineup-builder/composables/useLineupDialogs';

/**
 * Parámetros para el helper de edición de valor
 */
interface EditPlayerValueParams {
  playerId: number;
  lineupStore: ReturnType<typeof useLineupStore>;
  lineupDialogs: ReturnType<typeof useLineupDialogs>;
}

/**
 * Helper para editar valor del jugador
 * Abre el dialog de edición para modificar el valor del jugador
 *
 * Este helper centraliza la lógica que se usa en:
 * - SoccerField.vue
 * - BenchSlot.vue
 *
 * @param params - Parámetros necesarios
 */
export const handleEditPlayerValue = ({
  playerId,
  lineupStore,
  lineupDialogs,
}: EditPlayerValueParams): void => {
  const player = lineupStore.getLineupPlayerById(playerId);
  if (player) {
    lineupDialogs.openPlayerEditDialog(player);
  }
};
