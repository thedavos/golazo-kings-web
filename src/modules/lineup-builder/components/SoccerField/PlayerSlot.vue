<template>
  <div
    ref="playerRef"
    class="player-slot absolute cursor-grab select-none hover:scale-105 active:cursor-grabbing active:scale-110"
    :style="playerStyle"
    @click="handleClick"
  >
    <!-- Menu contextual -->
    <player-slot-menu
      v-if="player"
      :is-bench="false"
      :disabled="Boolean(isDragging)"
      @view-details="handleViewDetails"
      @edit-value="handleEditValue"
      @swap-player="handleSwapPlayer"
      @move-to-bench="handleMoveToBench"
      @remove-player="handleRemovePlayer"
    />
    <!-- Badge SVG -->
    <div class="relative w-full h-full pointer-events-none">
      <img
        alt="Player Badge"
        class="w-full h-full object-contain"
        :src="badgeSvg"
        :draggable="false"
      />

      <!-- Foto del jugador superpuesta en la parte superior del badge -->
      <div
        v-if="player && player.profileImageUrl"
        class="absolute top-[-10px] left-1/2 transform -translate-x-1/2 w-[58px] overflow-hidden"
      >
        <q-img
          :src="player.profileImageUrl"
          :alt="playerSlot.name || 'Player'"
          fit="contain"
          loading="lazy"
          class="w-full h-full"
          :draggable="false"
        >
          <template #error>
            <div class="absolute-full flex flex-center">
              <img
                :src="emptyPlayerImg"
                alt="Empty player"
                class="w-full h-full object-cover"
                :draggable="false"
              />
            </div>
          </template>
        </q-img>
      </div>

      <!-- Nombre del jugador superpuesto en la parte inferior del badge -->
      <div class="absolute bottom-[10px] left-0 right-0 flex justify-center">
        <span class="text-Extended-Banner text-[10px] font-bold text-center">
          {{ playerSlot.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import badgeSvg from 'src/assets/player/badge.svg';
import emptyPlayerImg from 'src/assets/player/empty-player.png';
import PlayerSlotMenu from './PlayerSlotMenu.vue';
import type { PlayerSlot, FieldArea } from 'src/modules/lineup-builder/types';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';

// ==================== TYPES ====================
interface Props {
  playerSlot: PlayerSlot;
  player: PlayerDto | null | undefined;
  containerWidth: number;
  containerHeight: number;
  fieldArea: FieldArea;
  isDragging?: boolean;
}

// ==================== CONSTANTS ====================
const BADGE_WIDTH = 63; // en píxeles (60 + 5% = 63)
const BADGE_HEIGHT = 100.41; // Proporción 384:612 del Figma (95.625 + 5% = 100.40625)

// ==================== PROPS & EMITS ====================

const props = withDefaults(defineProps<Props>(), {
  isDragging: false,
});

const emit = defineEmits<{
  playerClick: [playerId: string];
  viewDetails: [playerId: number];
  editValue: [playerId: number];
  swapPlayer: [playerId: number];
  moveToBench: [playerId: number];
  removePlayer: [playerId: number];
}>();

// ==================== COMPUTED ====================

/**
 * Calcula el estilo de posicionamiento del jugador dentro del área del campo
 */
const playerStyle = computed(() => {
  // Calcular posición dentro del área real del campo (no del canvas completo)
  const leftPx =
    props.fieldArea.offsetX + props.playerSlot.x! * props.fieldArea.width - BADGE_WIDTH / 2;
  const topPx =
    props.fieldArea.offsetY + props.playerSlot.y! * props.fieldArea.height - BADGE_HEIGHT / 2;

  return {
    left: `${leftPx}px`,
    top: `${topPx}px`,
    width: `${BADGE_WIDTH}px`,
    height: `${BADGE_HEIGHT}px`,
  };
});

// ==================== METHODS ====================

const handleClick = () => {
  // No abrir menú ni hacer click si se estaba arrastrando
  if (props.isDragging) {
    return;
  }

  if (!props.player) {
    emit('playerClick', props.playerSlot.id);
  }
};

const handleViewDetails = () => {
  if (props.player) {
    emit('viewDetails', props.player.id);
  }
};

const handleEditValue = () => {
  if (props.player) {
    emit('editValue', props.player.id);
  }
};

const handleSwapPlayer = () => {
  if (props.player) {
    emit('swapPlayer', props.player.id);
  }
};

const handleMoveToBench = () => {
  if (props.player) {
    emit('moveToBench', props.player.id);
  }
};

const handleRemovePlayer = () => {
  if (props.player) {
    emit('removePlayer', props.player.id);
  }
};
</script>

<style scoped>
.player-slot {
  pointer-events: auto;
  z-index: 10;
  touch-action: none; /* Prevenir scroll en dispositivos táctiles durante drag */
}
</style>
