<template>
  <div
    draggable="true"
    class="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg border border-blue-500/20 hover:bg-slate-700 cursor-grab active:cursor-grabbing transition-all duration-200 hover:border-blue-400/40"
    @dragstart="$emit('dragStart', player)"
  >
    <!-- Player Rating Badge -->
    <div
      class="w-10 h-10 rounded-lg bg-gradient-to-br border border-yellow-500/30 flex items-center justify-center"
    >
      <span class="text-sm font-black text-yellow-400">{{ player.positionAbbreviation }}</span>
    </div>

    <!-- Player Info -->
    <div class="flex-1">
      <span class="text-sm font-semibold text-white"
        >{{ player.firstName }} {{ player.lastName }}</span
      >
      <div class="text-xs text-gray-400">{{ player.team }}</div>
    </div>

    <!-- Player Price -->
    <div v-if="player.jerseyNumber" class="text-xs text-yellow-400 font-semibold">
      #{{ player.jerseyNumber }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';

interface Props {
  player: PlayerDto;
}

defineProps<Props>();

defineEmits(['dragStart']);
</script>
