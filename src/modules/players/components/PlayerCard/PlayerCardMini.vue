<template>
  <div
    draggable="true"
    class="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg border border-blue-500/20 hover:bg-slate-700 cursor-grab active:cursor-grabbing transition-all duration-200 hover:border-blue-400/40"
    @dragstart="$emit('dragStart', player)"
  >
    <!-- Player Rating Badge -->
    <div
      class="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400/20 to-yellow-600/5 border border-yellow-500/30 flex items-center justify-center"
    >
      <span class="text-sm font-black text-yellow-400">{{ player.jerseyNumber }}</span>
    </div>

    <!-- Player Info -->
    <div class="flex-1">
      <div class="flex items-center gap-2">
        <span class="text-sm font-semibold text-white"
          >{{ player.firstName }} {{ player.lastName }}</span
        >
        <q-badge
          :label="player.positionAbbreviation || 'MC'"
          color="blue"
          outline
          class="text-xs px-1.5 py-0.5 rounded border-blue-400/20"
        />
      </div>
      <div class="text-xs text-gray-400">{{ player.team }}</div>
    </div>

    <!-- Player Price -->
    <div class="text-xs text-yellow-400 font-semibold">€{{ playerPrice }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';

interface Props {
  player: PlayerDto;
}

const props = defineProps<Props>();

defineEmits(['dragStart']);

const playerPrice = computed(() => props.player.marketValue?.toLocaleString() || '100');
</script>
