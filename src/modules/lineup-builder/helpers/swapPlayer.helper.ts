import type { PlayerSlot } from 'src/modules/lineup-builder/types';
import type { useLineupStore } from 'stores/useLineupStore';
import type { useLineupDialogs } from 'src/modules/lineup-builder/composables/useLineupDialogs';
import type { useLineupFeedback } from 'src/modules/lineup-builder/composables/useLineupFeedback';

/**
 * Parámetros para el helper de intercambio de jugadores
 */
interface SwapPlayerParams {
  currentPlayerId: number;
  lineupStore: ReturnType<typeof useLineupStore>;
  lineupDialogs: ReturnType<typeof useLineupDialogs>;
  lineupFeedback: ReturnType<typeof useLineupFeedback>;
  allPlayersInSlots: PlayerSlot[];
}

/**
 * Helper para manejar el intercambio de jugadores
 * Abre el dialog de intercambio y ejecuta la lógica de swap
 *
 * Este helper centraliza la lógica de intercambio que se usa en:
 * - SoccerField.vue
 * - BenchSlot.vue
 *
 * @param params - Parámetros necesarios para el intercambio
 */
export const handleSwapPlayer = ({
  currentPlayerId,
  lineupStore,
  lineupDialogs,
  lineupFeedback,
  allPlayersInSlots,
}: SwapPlayerParams): void => {
  const currentPlayer = lineupStore.getLineupPlayerById(currentPlayerId);
  if (!currentPlayer) return;

  // Encontrar el slot actual del jugador
  const currentSlot = allPlayersInSlots.find((s) => s.playerId === currentPlayerId);

  lineupDialogs
    .openSwapPlayerDialog(currentPlayer, currentSlot, allPlayersInSlots)
    .onOk((payload: { targetPlayerId: number | null; targetSlotId?: string }) => {
      // Caso 1: Intercambio con otro jugador
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
      // Caso 2: Mover a slot vacío del campo
      else if (payload.targetSlotId) {
        // Mover el jugador al slot específico
        const success = lineupStore.movePlayerToSlot(currentPlayerId, payload.targetSlotId);

        if (success) {
          const playerName = `${currentPlayer.firstName} ${currentPlayer.lastName}`;
          lineupFeedback.success(`${playerName} movido a nueva posición`);
        } else {
          lineupFeedback.error('No se pudo mover el jugador');
        }
      }
    })
    .onCancel(() => {
      console.log('Dialog de intercambio cancelado');
    });
};
