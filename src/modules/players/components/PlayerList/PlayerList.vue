<template>
  <div class="space-y-3 max-h-fit overflow-y-auto">
    <p class="text-sm">Jugadores encontrados</p>
    <player-card-mini
      v-for="player in players"
      :key="player.id"
      :player="player"
      @click="selectPlayer(player)"
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

const emit = defineEmits(['select-player']);

const selectPlayer = (player: PlayerDto) => {
  emit('select-player', player);
};
</script>
