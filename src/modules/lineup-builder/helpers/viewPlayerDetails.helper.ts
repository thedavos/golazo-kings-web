import type { useLineupStore } from 'stores/useLineupStore';
import type { useLineupDialogs } from 'src/modules/lineup-builder/composables/useLineupDialogs';

/**
 * Parámetros para el helper de visualización de detalles
 */
interface ViewPlayerDetailsParams {
  playerId: number;
  lineupStore: ReturnType<typeof useLineupStore>;
  lineupDialogs: ReturnType<typeof useLineupDialogs>;
}

/**
 * Helper para ver detalles del jugador
 * Abre el dialog de información con los detalles del jugador (solo lectura)
 *
 * Este helper centraliza la lógica que se usa en:
 * - SoccerField.vue
 * - BenchSlot.vue
 *
 * @param params - Parámetros necesarios
 */
export const handleViewPlayerDetails = ({
  playerId,
  lineupStore,
  lineupDialogs,
}: ViewPlayerDetailsParams): void => {
  const player = lineupStore.getLineupPlayerById(playerId);
  if (player) {
    lineupDialogs.openPlayerInformationDialog(player);
  }
};
