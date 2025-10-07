<template>
  <div
    class="flex flex-col items-center cursor-pointer transition-transform duration-200 hover:scale-105 select-none"
    @click="handleClick"
  >
    <!-- Menu contextual -->
    <player-slot-menu
      v-if="player"
      :is-bench="true"
      @view-details="handleViewDetails"
      @edit-value="handleEditValue"
      @swap-player="handleSwapPlayer"
      @move-to-field="handleMoveToField"
      @remove-player="handleRemovePlayer"
    />
    <!-- Badge SVG del jugador -->
    <div class="relative" :style="{ width: `${BADGE_WIDTH}px`, height: `${BADGE_HEIGHT}px` }">
      <img
        :src="badgeSvg"
        alt="Player Badge"
        class="w-full h-full object-contain"
        :draggable="false"
      />

      <!-- Foto del jugador superpuesta en la parte superior del badge -->
      <div
        v-if="player && player.profileImageUrl"
        class="absolute top-[0px] left-1/2 transform -translate-x-1/2 w-[47px] overflow-hidden"
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
        <span class="text-Extended-Banner text-[10px] font-bold">
          {{ playerSlot.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import badgeSvg from 'src/assets/player/badge.svg';
import emptyPlayerImg from 'src/assets/player/empty-player.png';
import PlayerSlotMenu from './PlayerSlotMenu.vue';
import type { PlayerSlot } from 'src/modules/lineup-builder/types';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';

// ==================== TYPES ====================
interface Props {
  playerSlot: PlayerSlot;
  player: PlayerDto | null | undefined;
  allPlayersInLineup?: PlayerSlot[];
}

// ==================== CONSTANTS ====================

const BADGE_WIDTH = 60; // en píxeles
const BADGE_HEIGHT = 95.625; // Proporción 384:612 del Figma

// ==================== PROPS & EMITS ====================

const props = defineProps<Props>();

const emit = defineEmits<{
  click: [];
  viewDetails: [playerId: number];
  editValue: [playerId: number];
  swapPlayer: [playerId: number];
  moveToField: [playerId: number];
  removePlayer: [playerId: number];
}>();

// ==================== METHODS ====================

const handleClick = () => {
  emit('click');
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

const handleMoveToField = () => {
  if (props.player) {
    emit('moveToField', props.player.id);
  }
};

const handleRemovePlayer = () => {
  if (props.player) {
    emit('removePlayer', props.player.id);
  }
};
</script>
