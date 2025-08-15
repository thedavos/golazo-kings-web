<template>
  <q-dialog
    v-model="isOpen"
    maximized
    seamless
    transition-show="slide-up"
    transition-hide="slide-down"
    class="player-simple-dialog"
    :position="$q.screen.gt.xs ? 'standard' : 'bottom'"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <q-card class="bg-slate-900 text-white">
      <q-card-section class="row items-center pb-0 mb-4">
        <q-space />
        <q-btn flat round dense icon="fa fa-close" size="md" color="white" @click="closeDialog" />
      </q-card-section>

      <q-card-section class="pt-0">
        <!-- Search Bar -->
        <div class="row q-mb-lg">
          <div class="col-12">
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
                  @click="searchQuery = ''"
                />
              </template>
            </q-input>
          </div>
        </div>

        <!-- Sugerencias -->
        <q-list
          v-if="showSuggestions && suggestions.length > 0"
          bordered
          class="suggestion-list q-mt-xs"
        >
          <q-item-label header>Sugerencias</q-item-label>
          <q-item
            v-for="suggestion in suggestions"
            :key="suggestion"
            clickable
            @click="selectSuggestion(suggestion)"
            class="suggestion-item"
          >
            <q-item-section>
              <q-item-label>{{ suggestion }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="north_west" size="xs" />
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Players List -->
        <div v-if="searchResults.length > 0" class="space-y-3 max-h-96 overflow-y-auto">
          <div
            v-for="player in searchResults"
            :key="player.id"
            class="player-item bg-slate-800/80 border border-slate-700 hover:border-blue-500 transition-all cursor-pointer p-4 rounded-lg"
            :class="{
              'opacity-50 cursor-not-allowed': !canSelectPlayer(player),
              'hover:bg-slate-700/50': canSelectPlayer(player),
            }"
            @click="selectPlayer(player)"
          >
            <div class="flex items-center justify-between">
              <!-- Player Info -->
              <div class="flex-1">
                <div class="flex items-center gap-3">
                  <!-- Position Badge -->
                  <q-badge
                    :color="getPositionColor()"
                    :label="player.position!"
                    class="text-sm font-bold px-3 py-1"
                  />

                  <!-- Name and Team -->
                  <div class="flex-1">
                    <div class="text-lg font-bold text-white">
                      {{ player.firstName }} {{ player.lastName }}
                    </div>
                    <div class="text-sm text-gray-400">
                      {{ player.team || 'Sin equipo' }}
                    </div>
                  </div>

                  <!-- Price -->
                  <div class="text-right">
                    <div class="text-xl font-bold text-yellow-400">
                      {{ formatter(player.marketValue || 0) }}
                    </div>
                    <div class="text-xs text-gray-400">Valor de mercado</div>
                  </div>
                </div>
              </div>

              <!-- Status Indicator -->
              <div class="ml-4">
                <q-chip
                  v-if="!canSelectPlayer(player)"
                  :color="getStatusChipColor(player)"
                  :text-color="getStatusChipTextColor(player)"
                  :icon="getStatusIcon(player)"
                  size="sm"
                >
                  {{ getStatusText(player) }}
                </q-chip>

                <q-icon v-else name="add_circle" size="md" class="text-green-400" />
              </div>
            </div>
          </div>
        </div>

        <!-- No Results Message -->
        <q-banner
          v-if="hasNoResults"
          class="text-center py-12 bg-slate-800/80 border border-slate-700"
          rounded
        >
          <template #avatar>
            <q-icon name="fa fa-search" color="text-gray-500 mb-4" />
          </template>
          No se encontraron jugadores para "{{ searchQuery }}"
          <template #action>
            <q-btn flat color="primary" label="Limpiar" @click="clearSearch" />
          </template>
        </q-banner>

        <!-- Search Prompt -->
        <div v-else class="text-center py-12">
          <q-icon name="fa fa-search" size="4rem" class="text-gray-500 mb-4" />
          <div class="text-xl text-gray-400 mb-2">Busca un jugador</div>
          <div class="text-sm text-gray-500">
            Escribe el nombre, posición o equipo del jugador que buscas
          </div>
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
  formatter: (value: number) => string;
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
  hasNoResults,
  initializeSearch,
  instantSearch,
  clearSearch,
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

// Methods
const canSelectPlayer = (player: PlayerDto): boolean => {
  // Check if player is already selected
  const isAlreadySelected = props.selectedPlayers.some((p) => p.id === player.id);
  if (isAlreadySelected) return false;

  // Check budget
  const exceedsBudget = (player.marketValue || 0) > props.remainingBudget;
  if (exceedsBudget) return false;

  // Check position compatibility (if required)
  return !(props.requiredPosition && player.position !== props.requiredPosition);
};

const selectPlayer = (player: PlayerDto) => {
  if (!canSelectPlayer(player)) return;

  emit('player-selected', player);
  searchQuery.value = `${player.firstName} ${player.lastName}`;
  showSuggestions.value = false;
  // closeDialog();
};

const selectSuggestion = (suggestion: string) => {
  searchQuery.value = suggestion;
  instantSearch(suggestion);
};

const closeDialog = () => {
  emit('update:model-value', false);
  searchQuery.value = '';
};

const getPositionColor = (): string => {
  return 'grey';
};

const getStatusText = (player: PlayerDto): string => {
  const isAlreadySelected = props.selectedPlayers.some((p) => p.id === player.id);
  if (isAlreadySelected) return 'Ya seleccionado';

  const exceedsBudget = (player.marketValue || 0) > props.remainingBudget;
  if (exceedsBudget) return 'Sin presupuesto';

  if (props.requiredPosition && player.position !== props.requiredPosition) {
    return 'Posición incorrecta';
  }

  return 'Disponible';
};

const getStatusChipColor = (player: PlayerDto): string => {
  const isAlreadySelected = props.selectedPlayers.some((p) => p.id === player.id);
  if (isAlreadySelected) return 'orange';

  const exceedsBudget = (player.marketValue || 0) > props.remainingBudget;
  if (exceedsBudget) return 'red';

  if (props.requiredPosition && player.position !== props.requiredPosition) {
    return 'purple';
  }

  return 'green';
};

const getStatusChipTextColor = (player: PlayerDto): string => {
  console.log('getStatusChipTextColor: ', player);
  return 'white';
};

const getStatusIcon = (player: PlayerDto): string => {
  const isAlreadySelected = props.selectedPlayers.some((p) => p.id === player.id);
  if (isAlreadySelected) return 'check_circle';

  const exceedsBudget = (player.marketValue || 0) > props.remainingBudget;
  if (exceedsBudget) return 'money_off';

  if (props.requiredPosition && player.position !== props.requiredPosition) {
    return 'block';
  }

  return 'add_circle';
};

const onFocus = () => {
  isFocused.value = true;
  if (suggestions.value.length > 0 && !searchResults.value.length) {
    showSuggestions.value = true;
  }
};

const onBlur = () => {
  // Delay para permitir clics en sugerencias
  setTimeout(() => {
    isFocused.value = false;
    showSuggestions.value = false;
  }, 200);
};
</script>

<style scoped>
.player-item:hover:not(.opacity-50) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

.player-item {
  transition: all 0.2s ease-in-out;
}

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
