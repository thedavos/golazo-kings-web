<template>
  <div class="h-full w-full p-4 overflow-hidden">
    <div class="flex items-center mb-4">
      <player-search class="grow" :is-loading="false" />
      <q-btn
        dense
        unelevated
        rounded
        class="p-2 ml-1 self-center"
        icon="la la-filter"
        size="sm"
        @click="toggleFilters"
      />
    </div>

    <transition
      appear
      enter-active-class="animated fadeInRight"
      leave-active-class="animated fadeOutRight"
    >
      <lineup-sidebar-filters
        v-if="showFilters"
        class="mb-4"
        :key="CONST.FILTER.KEY"
        @filters-updated="updatePlayers"
      />
    </transition>

    <q-scroll-area class="h-full">
      <!-- Estado: Con resultados de búsqueda -->
      <player-list
        v-if="searchResults.length > 0"
        class="pr-[20px]"
        :ad-interval="5"
        :players="searchResults"
        :extra-class="showFilters ? 'pb-[160px]' : 'pb-[60px]'"
        :get-player-status="getPlayerStatus"
        @edit="editPlayer"
        @add-to-field="addPlayerToField"
        @add-to-bench="addPlayerToBench"
        @move-player="movePlayer"
        @remove-from-lineup="removePlayerFromLineup"
      />

      <!-- Estado: Sin resultados de búsqueda -->
      <div v-else-if="hasActiveSearch" class="flex flex-col items-center justify-center py-12 px-4">
        <q-icon name="la la-search" size="lg" class="text-text-muted mb-4" />
        <p class="text-text-default text-sm font-medium mb-4">¿No encuentras a un jugador?</p>
        <q-btn
          outline
          no-caps
          color="primary"
          icon="la la-plus"
          label="Añadir jugador"
          size="sm"
          @click="addNewPlayer"
        />
      </div>

      <!-- Estado: Inicial (sin búsqueda) -->
      <div v-else class="flex flex-col items-center justify-center py-12 px-4">
        <q-icon name="la la-users" size="xl" color="primary" class="mb-4" />
        <p class="text-text-default text-base font-medium mb-2">
          Busca jugadores para tu alineación
        </p>
        <p
          class="text-text-muted text-sm text-center max-w-[280px] flex items-center justify-center gap-1 flex-wrap mb-4"
        >
          <span>Usa el</span>
          <span class="inline-flex items-center gap-1">
            <q-icon name="la la-search" size="14px" class="text-primary" />
            <span class="font-medium text-text-default">buscador</span>
          </span>
          <span>o los</span>
          <span class="inline-flex items-center gap-1">
            <q-icon name="la la-filter" size="14px" class="text-primary" />
            <span class="font-medium text-text-default">filtros</span>
          </span>
        </p>
      </div>
    </q-scroll-area>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { PlayerSearch } from 'src/modules/players/components/PlayerSearch';
import { PlayerList } from 'src/modules/players/components/PlayerList';
import LineupSidebarFilters from './LineupSidebarFilters.vue';
import { useSharedPlayerSearch } from 'src/modules/players/composables/usePlayerSearch';
import { useLineupDialogs } from 'src/modules/lineup-builder/composables/useLineupDialogs';
import { useLineupFeedback } from 'src/modules/lineup-builder/composables/useLineupFeedback';
import { useLineupStore } from 'stores/useLineupStore';
import { CONST } from 'src/modules/lineup-builder/constants';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';

const showFilters = ref(false);

const lineupStore = useLineupStore();
const { filters, players, orderBy } = storeToRefs(lineupStore);

const { openPlayerEditDialog } = useLineupDialogs();
const lineupFeedback = useLineupFeedback();
const { initializeSearch, searchResults, setPlayers, searchQuery } = useSharedPlayerSearch({
  filters,
  sortBy: orderBy,
});

void initializeSearch(players.value);

// Watch para actualizar búsqueda cuando players del store cambien (ej: al modificar jugador)
watch(
  players,
  (newPlayers) => {
    setPlayers(newPlayers);
  },
  { deep: true },
);

// Computed para detectar si hay una búsqueda activa
const hasActiveSearch = computed(() => {
  return searchQuery.value.trim().length > 0;
});

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const updatePlayers = () => {
  setPlayers(players.value);
};

const addNewPlayer = () => {
  // TODO: Implementar lógica para añadir nuevo jugador
  console.log('Añadir nuevo jugador');
};

const editPlayer = ({ player }: { player: PlayerDto }) => {
  openPlayerEditDialog(player);
};

// ==================== LINEUP HANDLERS ====================

/**
 * Obtiene el estado de un jugador en la alineación
 */
const getPlayerStatus = (playerId: string | number) => {
  return lineupStore.getPlayerLineupStatus(playerId);
};

/**
 * Añade un jugador al campo
 */
const addPlayerToField = ({ player }: { player: PlayerDto }) => {
  const added = lineupStore.addLineupPlayer(player, false);
  const name = `${player.firstName} ${player.lastName}`.toUpperCase();
  
  if (added) {
    lineupFeedback.playerAddedToField(name);
  } else {
    // Verificar si ya está en la alineación
    const status = lineupStore.getPlayerLineupStatus(player.id);
    if (status.inLineup) {
      lineupFeedback.playerAlreadySelected();
    } else {
      // No hay slots disponibles en el campo
      lineupFeedback.fieldFull();
    }
  }
};

/**
 * Añade un jugador a la banca
 */
const addPlayerToBench = ({ player }: { player: PlayerDto }) => {
  const added = lineupStore.addLineupPlayer(player, true);
  const name = `${player.firstName} ${player.lastName}`.toUpperCase();
  
  if (added) {
    lineupFeedback.playerAddedToBench(name);
  } else {
    // Verificar si ya está en la alineación
    const status = lineupStore.getPlayerLineupStatus(player.id);
    if (status.inLineup) {
      lineupFeedback.playerAlreadySelected();
    } else {
      // No hay slots disponibles en la banca
      lineupFeedback.benchFull();
    }
  }
};

/**
 * Mueve un jugador entre campo y banca
 */
const movePlayer = ({ player }: { player: PlayerDto }) => {
  const status = lineupStore.getPlayerLineupStatus(player.id);
  const newIsBench = !status.isBench;
  lineupStore.moveLineupPlayer(player.id, newIsBench);
  
  const name = `${player.firstName} ${player.lastName}`.toUpperCase();
  lineupFeedback.playerMoved(name, newIsBench);
};

/**
 * Remueve un jugador de la alineación
 */
const removePlayerFromLineup = ({ player }: { player: PlayerDto }) => {
  lineupStore.removeLineupPlayer(player.id);
  const name = `${player.firstName} ${player.lastName}`.toUpperCase();
  lineupFeedback.playerRemoved(name);
};
</script>
