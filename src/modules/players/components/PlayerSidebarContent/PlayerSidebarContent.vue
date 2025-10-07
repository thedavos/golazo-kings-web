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
    <div class="col-11 mx-auto"></div>
  </div>
</template>

<script setup lang="ts">
import { useSharedPlayerSearch } from 'src/modules/players/composables/usePlayerSearch';
import { useSharedDemoBuilder } from 'src/modules/home/composables/useDemoBuilder';
import { PlayerSearch } from 'src/modules/players/components/PlayerSearch';
import { PlayerSuggestions } from 'src/modules/players/components/PlayerSuggestions';

const emit = defineEmits(['close-sidebar']);

const { demoPlayers, resetSelectedSlot } = useSharedDemoBuilder();

const { searchQuery, suggestions, showSuggestions, instantSearch, isLoading, clearSearch } =
  useSharedPlayerSearch();

const closeSidebar = () => {
  clearSearch();
  resetSelectedSlot('field');
  emit('close-sidebar');
};

const selectSuggestion = (suggestion: string) => {
  searchQuery.value = suggestion;
  instantSearch(suggestion);
};
</script>
