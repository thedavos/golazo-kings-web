<template>
  <div :class="containerClass">
    <p class="text-sm font-semibold">Jugadores encontrados</p>
    <transition-group
      appear
      name="player-list"
      tag="div"
      class="space-y-3"
      enter-active-class="animated fadeInRight"
      leave-active-class="animated fadeOutRight"
      move-class="player-list-move"
    >
      <template v-for="(player, index) in players" :key="player.id">
        <!-- Componente jugador -->
        <player-card-mini
          :player="player"
          :get-player-status="getPlayerStatus"
          @edit="editPlayer(player, index)"
          @add-to-field="addToField(player, index)"
          @add-to-bench="addToBench(player, index)"
          @move-player="movePlayer(player, index)"
          @remove-from-lineup="removeFromLineup(player, index)"
          @drag-start="handleDragStart(player)"
        />

        <!-- Ad cada 5 jugadores (empezando desde el 5to) -->
        <ad-in-feed v-if="shouldShowAd(index)" :key="`ad-${Math.floor(index / adInterval)}`" />
      </template>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import clsx from 'clsx';
import { PlayerCardMini } from 'src/modules/players/components/PlayerCard';
import { AdInFeed } from 'src/modules/ads/components';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';

interface Props {
  players: Readonly<PlayerDto[]>;
  extraClass?: string;
  adInterval: number; // Cada cuántos jugadores mostrar un ad
  getPlayerStatus: (playerId: string | number) => {
    inLineup: boolean;
    isBench: boolean | null;
  };
}

const props = withDefaults(defineProps<Props>(), {
  adInterval: 5, // Por defecto, cada 5 jugadores
});

const emit = defineEmits([
  'edit',
  'drag-start',
  'add-to-field',
  'add-to-bench',
  'move-player',
  'remove-from-lineup',
]);

const containerClass = computed(() => clsx('space-y-3 max-h-fit pb-[60px]', props.extraClass));

// Función para determinar si mostrar un ad después del jugador en el índice dado
const shouldShowAd = (index: number): boolean => {
  // Mostrar ad cada N jugadores (empezando desde el N-1 índice)
  // Ejemplo: si adInterval = 5, mostrar ads después de los índices 4, 9, 14, etc.
  return (index + 1) % props.adInterval === 0 && index < props.players.length - 1;
};

const addToField = (player: PlayerDto, index: number) => {
  emit('add-to-field', { player, index });
};

const addToBench = (player: PlayerDto, index: number) => {
  emit('add-to-bench', { player, index });
};

const movePlayer = (player: PlayerDto, index: number) => {
  emit('move-player', { player, index });
};

const removeFromLineup = (player: PlayerDto, index: number) => {
  emit('remove-from-lineup', { player, index });
};

const editPlayer = (player: PlayerDto, index: number) => {
  emit('edit', { player, index });
};

const handleDragStart = (player: PlayerDto) => {
  emit('drag-start', player);
};
</script>

<style scoped>
/* Animación de salida - posición absoluta para evitar saltos */
.player-list-leave-active {
  position: absolute;
  width: calc(100% - 12px);
  opacity: 0;
}

/* Animación de movimiento cuando los elementos cambian de posición */
.player-list-move {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); /* easeInOutCubic */
}
</style>
