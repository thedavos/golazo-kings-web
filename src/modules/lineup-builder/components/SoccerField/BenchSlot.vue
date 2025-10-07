<template>
  <div
    class="absolute bottom-0 left-0 right-0 h-[125px] bg-Extended-Text z-10 border-t-1 border-t-white"
  >
    <!-- Label BANCA -->
    <div
      class="absolute top-[16px] left-[16px] text-white text-xs font-bold uppercase tracking-wide"
    >
      BANQUILLO
    </div>

    <!-- Grid de jugadores -->
    <div class="absolute inset-0 flex items-center justify-center px-4">
      <div class="flex gap-10 items-center">
        <bench-player-slot
          v-for="slot in benchSlotPlayers"
          :key="slot.id"
          :player-slot="slot"
          :player="lineupStore.getLineupPlayerById(slot.playerId)"
          @click="emit('playerClick', slot.id)"
          @view-details="onViewPlayerDetails"
          @edit-value="onEditPlayerValue"
          @swap-player="onSwapPlayer"
          @move-to-field="onMovePlayerToField"
          @remove-player="onRemovePlayer"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import BenchPlayerSlot from './BenchPlayerSlot.vue';
import { useLineupStore } from 'stores/useLineupStore';
import { useLineupDialogs } from 'src/modules/lineup-builder/composables/useLineupDialogs';
import { useLineupFeedback } from 'src/modules/lineup-builder/composables/useLineupFeedback';
import type { PlayerSlot } from 'src/modules/lineup-builder/types';
import {
  handleSwapPlayer,
  handleViewPlayerDetails,
  handleEditPlayerValue,
  handleMovePlayerToField,
  handleRemovePlayer,
} from 'src/modules/lineup-builder/helpers';

interface Props {
  benchSlotPlayers: PlayerSlot[];
}

defineProps<Props>();

const emit = defineEmits<{
  playerClick: [playerId: string];
}>();

const lineupStore = useLineupStore();
const { allPlayersInSlots } = storeToRefs(lineupStore);

// Composables
const lineupDialogs = useLineupDialogs();
const lineupFeedback = useLineupFeedback();

// ==================== HANDLERS ====================
// Nota: Los handlers ahora usan helpers importados para evitar duplicación de código

/**
 * Wrapper para ver detalles del jugador
 */
const onViewPlayerDetails = (playerId: number) => {
  handleViewPlayerDetails({ playerId, lineupStore, lineupDialogs });
};

/**
 * Wrapper para editar valor del jugador
 */
const onEditPlayerValue = (playerId: number) => {
  handleEditPlayerValue({ playerId, lineupStore, lineupDialogs });
};

/**
 * Wrapper para intercambiar jugador
 */
const onSwapPlayer = (currentPlayerId: number) => {
  handleSwapPlayer({
    currentPlayerId,
    lineupStore,
    lineupDialogs,
    lineupFeedback,
    allPlayersInSlots: allPlayersInSlots.value,
  });
};

/**
 * Wrapper para mover jugador de la banca al campo
 */
const onMovePlayerToField = (playerId: number) => {
  handleMovePlayerToField({ playerId, lineupStore, lineupFeedback });
};

/**
 * Wrapper para remover jugador
 */
const onRemovePlayer = (playerId: number) => {
  handleRemovePlayer({ playerId, lineupStore, lineupFeedback });
};
</script>
