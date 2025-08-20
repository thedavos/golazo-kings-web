<template>
  <q-toolbar>
    <q-toolbar-title>Buscar jugadores</q-toolbar-title>
    <q-btn
      flat
      round
      dense
      icon="fa fa-arrow-left"
      size="sm"
      color="white"
      class="bg-gray-500/20 hover:bg-gray-500/30"
      @click="closeSidebar"
    />
  </q-toolbar>

  <div class="row">
    <div class="col-11 mx-auto">
      <player-search class="mt-2" :players="demoPlayers" :is-loading="isLoading" />
    </div>
  </div>

  <div v-if="showSuggestions && suggestions.length > 0" class="row">
    <div class="col-11 mx-auto">
      <player-suggestions
        class="mt-2"
        :suggestions="suggestions"
        @select-suggestion="selectSuggestion"
      />
    </div>
  </div>

  <div class="row">
    <div class="col-11 mx-auto">
      <player-list
        v-if="searchResults.length > 0"
        class="mt-2"
        :players="searchResults"
        @select-player="selectPlayer"
      />

      <!-- No Results Message -->
      <q-banner v-else-if="hasNoResults" class="text-center bg-transparent py-12" rounded>
        <p>No se encontraron jugadores para "{{ searchQuery }}"</p>
        <template #action>
          <div class="w-full mx-auto">
            <q-btn outline size="md" color="primary" label="Limpiar" @click="clearSearch" />
          </div>
        </template>
      </q-banner>

      <!-- Search Prompt -->
      <div v-else class="text-center mt-8">
        <q-icon name="fa fa-search" size="xl" class="text-gray-500 mb-4" />
        <div class="text-xl text-gray-400 mb-2">Busca un jugador</div>
        <div class="text-sm text-gray-500">
          Escribe el nombre, posición o equipo del jugador que buscas
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuasar } from 'quasar';
import { useSharedPlayerSearch } from 'src/modules/players/composables/usePlayerSearch';
import { useSharedDemoBuilder } from 'src/modules/home/composables/useDemoBuilder';
import { PlayerSearch } from 'src/modules/players/components/PlayerSearch';
import { PlayerList } from 'src/modules/players/components/PlayerList';
import { PlayerSuggestions } from 'src/modules/players/components/PlayerSuggestions';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';

const emit = defineEmits(['close-sidebar']);

const $q = useQuasar();

const {
  demoPlayers,
  lineup,
  bench,
  remainingBudget,
  onPlayerSelected,
  selectedSlotPosition: requiredPosition,
} = useSharedDemoBuilder();

const {
  searchQuery,
  searchResults,
  suggestions,
  showSuggestions,
  hasNoResults,
  instantSearch,
  isLoading,
  clearSearch,
} = useSharedPlayerSearch();

const allSelectedPlayers = computed(() => {
  return [
    ...Object.values(lineup.value).filter(Boolean),
    ...Object.values(bench.value).filter(Boolean),
  ];
});

const canSelectPlayer = (player: PlayerDto): boolean => {
  // Check if a player is already selected
  const isAlreadySelected = allSelectedPlayers.value.some((p) => p.id === player.id);
  if (isAlreadySelected) return false;

  // Check budget
  const exceedsBudget = (player.marketValue || 0) > remainingBudget.value;
  if (exceedsBudget) return false;

  // Check position compatibility (if required)
  return !(requiredPosition.value && player.positionAbbreviation !== requiredPosition.value);
};

const selectPlayer = (player: PlayerDto) => {
  if (!canSelectPlayer(player))
    return $q.notify({
      message: getPlayerAlert(player),
      position: 'bottom-left',
      color: 'primary',
      timeout: 2500,
    });

  onPlayerSelected(player);
};

const closeSidebar = () => {
  clearSearch();
  emit('close-sidebar');
};

const selectSuggestion = async (suggestion: string) => {
  searchQuery.value = suggestion;
  await instantSearch(suggestion);
};

const getPlayerAlert = (player: PlayerDto): string => {
  const isAlreadySelected = allSelectedPlayers.value.some((p) => p.id === player.id);
  if (isAlreadySelected)
    return player.isQueensLeaguePlayer
      ? 'La jugadora ya está seleccionada'
      : 'El jugador ya está seleccionado';

  const exceedsBudget = (player.marketValue || 0) > remainingBudget.value;
  if (exceedsBudget)
    return `Te quedaste sin presupuesto para armar tu equipo, ajusta o descarta a ${player.isQueensLeaguePlayer ? 'alguna jugadora' : 'algún jugador'}`;

  if (requiredPosition.value && player.positionAbbreviation !== requiredPosition.value) {
    return `Posición incorrecta para ${player.isQueensLeaguePlayer ? 'la jugadora' : 'el jugador'}`;
  }

  return 'Disponible';
};
</script>
