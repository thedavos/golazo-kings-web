<template>
  <div class="space-y-3 max-h-fit overflow-y-auto">
    <p class="text-sm">Jugadores encontrados</p>
    <player-card-mini
      v-for="player in players"
      :key="player.id"
      :player="player"
      @click="selectPlayer(player)"
      @drag-start="handleDragStart(player)"
    />
  </div>
</template>

<script setup lang="ts">
import { PlayerCardMini } from 'src/modules/players/components/PlayerCard';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';

interface Props {
  players: Readonly<PlayerDto[]>;
}

defineProps<Props>();

const emit = defineEmits(['select-player', 'drag-start']);

const selectPlayer = (player: PlayerDto) => {
  emit('select-player', player);
};

const handleDragStart = (player: PlayerDto) => {
  emit('drag-start', player);
};
</script>
