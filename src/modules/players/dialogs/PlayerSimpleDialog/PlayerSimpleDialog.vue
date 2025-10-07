<template>
  <q-dialog
    v-model="isOpen"
    maximized
    seamless
    transition-show="slide-up"
    transition-hide="slide-down"
    class="player-simple-dialog"
    @update:model-value="$emit('update:model-value', $event)"
    @keydown.esc="closeDialog"
  >
    <q-card class="bg-slate-900 text-white">
      <q-card-section class="row items-center pb-0 mb-4">
        <q-space />
        <q-btn flat round dense icon="fa fa-close" size="md" color="white" @click="closeDialog" />
      </q-card-section>

      <q-card-section class="pt-0">
        <!-- Search Bar -->
        <div class="row">
          <div class="col-8 mx-auto">
            <q-input
              v-model="searchQuery"
              name="searchQuery"
              outlined
              dense
              rounded
              autofocus
              placeholder="Buscar por nombre, posición o equipo..."
              input-class="text-white"
              bg-color="slate-800"
              color="blue"
              class="text-white w-full"
              :loading="isLoading"
              @focus="onFocus"
              @blur="onBlur"
            >
              <template #prepend>
                <q-icon name="fa fa-search" size="xs" color="white" class="mr-1" />
              </template>
              <template #append v-if="searchQuery">
                <q-icon
                  name="fa fa-close"
                  size="xs"
                  class="cursor-pointer"
                  color="white"
                  @click="searchQuery = ''"
                />
              </template>
            </q-input>
          </div>
        </div>

        <!-- Sugerencias -->
        <div v-if="showSuggestions && suggestions.length > 0" class="row">
          <div class="col-8 mx-auto py-3">
            <div class="flex gap-2">
              <q-badge
                v-for="(suggestion, index) in suggestions"
                class="cursor-pointer"
                :key="`suggestion-${index}`"
                :label="suggestion"
                @click="selectSuggestion(suggestion)"
              />
            </div>
          </div>
        </div>

        <div class="row mt-10">
          <div class="col-8 mx-auto"></div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { usePlayerSearch } from 'src/modules/players/composables/usePlayerSearch';
import type { PlayerPosition } from 'src/modules/players/domain/value-objects/player-position.enum';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';

// Props
interface Props {
  modelValue: boolean;
  players: PlayerDto[];
  selectedPlayers: PlayerDto[];
  remainingBudget: number;
  requiredPosition?: PlayerPosition | null;
}

const props = withDefaults(defineProps<Props>(), {
  requiredPosition: null,
});

// Reactive state
const isFocused = ref(false);

// Emits
const emit = defineEmits(['update:model-value', 'player-selected']);

// Composable
const {
  searchQuery,
  searchResults,
  suggestions,
  showSuggestions,
  initializeSearch,
  instantSearch,
  isLoading,
} = usePlayerSearch();

void initializeSearch(props.players);

watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) {
      searchQuery.value = '';
    }
  },
);

// Computed properties
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:model-value', value),
});

const selectSuggestion = (suggestion: string) => {
  searchQuery.value = suggestion;
  instantSearch(suggestion);
};

const closeDialog = () => {
  emit('update:model-value', false);
  searchQuery.value = '';
};

// const getPlayerAlert = (player: PlayerDto): string => {
//   const isAlreadySelected = props.selectedPlayers.some((p) => p.id === player.id);
//   if (isAlreadySelected) return 'El jugador ya ha sido seleccionado en el campo o en la banca';
//
//   const exceedsBudget = (player.marketValue || 0) > props.remainingBudget;
//   if (exceedsBudget)
//     return 'Te quedaste sin presupuesto para armar tu equipo, ajusta o descarta a algún jugador';
//
//   if (props.requiredPosition && player.position !== props.requiredPosition) {
//     return 'Posición incorrecta para el jugador';
//   }
//
//   return 'Disponible';
// };

const onFocus = () => {
  isFocused.value = true;
  if (suggestions.value.length > 0 && !searchResults.value.length) {
    // showSuggestions.value = true;
  }
};

const onBlur = () => {
  // Delay para permitir clics en sugerencias
  setTimeout(() => {
    isFocused.value = false;
    // showSuggestions.value = false;
  }, 200);
};
</script>

<style scoped>
.player-simple-dialog {
  width: 100%;
  max-width: 900px;
}

@media (max-width: 600px) {
  .player-simple-dialog {
    max-width: 100%;
  }
}
</style>
