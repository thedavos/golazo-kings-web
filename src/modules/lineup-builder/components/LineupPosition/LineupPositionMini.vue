<template>
  <div
    class="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
    :style="{ left: `${fieldPosition.x}%`, top: `${fieldPosition.y}%` }"
    @dragover.prevent
    @drop="handleDrop"
  >
    <!-- Player assigned to position -->
    <div
      v-if="player"
      :style="{ width: `${positionDimension}px`, height: `${positionDimension}px` }"
      :class="[
        'rounded-full bg-gradient-to-br flex items-center justify-center hover:scale-110 transition-transform border-2 border-white shadow-lg',
        isKings ? 'from-yellow-300 to-yellow-600' : 'from-blue-300 to-blue-600',
      ]"
      @click="$emit('remove', fieldPosition.id)"
    >
      <span class="text-xs font-bold text-white">{{ playerInitials }}</span>
    </div>

    <!-- Empty position slot -->
    <div
      v-else
      :style="{ width: `${positionDimension}px`, height: `${positionDimension}px` }"
      class="rounded-full border-2 border-dashed border-white/50 flex items-center justify-center bg-black/10 hover:bg-primary transition-colors"
    >
      <span class="text-xs font-bold text-white">{{ fieldPosition.abbreviation }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getInitials } from 'src/modules/shared/utils/initials.util';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';
import type { FieldPosition } from 'src/modules/lineup-builder/components/LineupField';

interface Props {
  fieldPosition: FieldPosition;
  positionDimension: number;
  player: PlayerDto;
  isKings: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits(['drop', 'remove']);

const playerInitials = computed(() => getInitials(props.player.firstName, props.player.lastName));

const handleDrop = (e: Event) => {
  e.preventDefault();
  emit('drop', props.fieldPosition.id, props.fieldPosition.position);
};
</script>
