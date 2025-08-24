<template>
  <section class="pb-16">
    <div id="builder-container" class="container mx-auto px-6">
      <div class="text-center mb-12">
        <h2 class="text-4xl text-primary font-bold mb-4">Demo Interactivo</h2>
        <p class="text-xl text-gray-300 mb-2">¡Prueba el constructor ahora sin registrarte!</p>
        <p class="text-lg text-blue-400">
          Forma tu plantilla completa con 7 titulares + 5 suplentes. Presupuesto:
          {{ currentCurrency.formatter(budgetAmount) }}
        </p>
      </div>

      <div class="grid lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
        <!-- Budget & Stats -->
        <div id="builder-configuration" class="lg:col-span-1 space-y-4">
          <q-card class="bg-slate-800/50 border border-blue-500/20 backdrop-blur-sm p-6">
            <div class="flex items-center gap-2 mb-4">
              <q-icon name="fas fa-gear" class="text-yellow-400" size="sm" />
              <h3 class="text-xl font-bold text-white">Configuración</h3>
            </div>

            <div class="space-y-4">
              <!-- League Selector -->
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Liga</label>
                <q-select
                  v-model="selectedLeagueValue"
                  name="selectLeague"
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  outlined
                  dense
                  color="blue"
                  bg-color="slate-700"
                  class="text-white"
                  dropdown-icon="fa fa-caret-down"
                  popup-content-class="bg-slate-800 text-white"
                  :options="leagueOptions"
                >
                  <template #option="{ opt, selected, toggleOption }">
                    <q-item
                      :active="selected"
                      @click="toggleOption(opt)"
                      clickable
                      class="hover:bg-slate-600"
                    >
                      <q-item-section avatar>
                        <q-icon :name="opt.icon" :class="opt.color" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-white">{{ opt.label }}</q-item-label>
                        <q-item-label caption class="text-gray-400">{{
                          opt.description
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>

                  <template #selected-item="{ opt }">
                    <div class="flex items-center gap-2">
                      <q-icon :name="opt.icon" :class="opt.color" size="sm" />
                      <span class="text-white">{{ opt.label }}</span>
                    </div>
                  </template>
                </q-select>
              </div>

              <!-- Budget Configuration -->
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2"
                  >Presupuesto Total</label
                >
                <div class="flex gap-2">
                  <!-- Currency Selector -->
                  <q-select
                    v-model="selectedCurrency"
                    name="currencySelector"
                    option-label="label"
                    option-value="value"
                    emit-value
                    map-options
                    outlined
                    color="blue"
                    bg-color="slate-700"
                    class="text-white w-24"
                    popup-content-class="bg-slate-800 text-white"
                    style="min-width: 110px"
                    dropdown-icon="fa fa-caret-down"
                    :options="currencyOptions"
                  >
                    <template #option="{ opt, selected, toggleOption }">
                      <q-item
                        :active="selected"
                        clickable
                        class="hover:bg-slate-600"
                        @click="toggleOption(opt)"
                      >
                        <q-item-section avatar>
                          <span class="text-lg text-yellow-400">{{ opt.symbol }}</span>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-white">{{ opt.code }}</q-item-label>
                          <q-item-label caption class="text-gray-400">{{ opt.label }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>

                    <template #selected-item="{ opt }">
                      <div class="flex items-center gap-2">
                        <span class="text-lg text-yellow-400">{{ opt.symbol }}</span>
                        <span class="text-white text-sm">{{ opt.code }}</span>
                      </div>
                    </template>
                  </q-select>

                  <!-- Budget Amount Input -->
                  <q-input
                    v-model="budgetAmount"
                    hide-bottom-space
                    outlined
                    unmasked-value
                    name="budgetAmountInput"
                    min="1000"
                    max="10000000"
                    step="1000"
                    color="blue"
                    bg-color="slate-700"
                    class="text-white flex-1"
                    input-class="text-white"
                    no-error-icon
                    reverse-fill-mask
                    :mask="currentCurrency.mask"
                    :rules="[(val) => val > 0 || 'El presupuesto debe ser mayor a 0']"
                  >
                    <template #prepend>
                      <span v-if="currentCurrency" class="text-yellow-400 font-semibold">{{
                        currentCurrency.symbol
                      }}</span>
                    </template>
                  </q-input>
                </div>
                <div class="mt-1 text-xs text-gray-400">
                  Presupuesto: {{ currentCurrency.formatter(budgetAmount) }}
                </div>
              </div>

              <!-- Formation Selector -->
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Formación</label>
                <q-select
                  v-model="selectedFormation"
                  name="selectFormation"
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  outlined
                  dense
                  color="blue"
                  bg-color="slate-700"
                  class="text-white"
                  dropdown-icon="fa fa-caret-down"
                  popup-content-class="bg-slate-800 text-white"
                  :options="formationOptions"
                >
                  <template #option="{ opt, selected, toggleOption }">
                    <q-item
                      :active="selected"
                      @click="toggleOption(opt)"
                      clickable
                      class="hover:bg-slate-600"
                    >
                      <q-item-section>
                        <q-item-label class="text-white">{{ opt.label }}</q-item-label>
                        <q-item-label caption class="text-gray-400">{{
                          opt.description
                        }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-badge :label="opt.players" color="blue" outline />
                      </q-item-section>
                    </q-item>
                  </template>

                  <template #selected-item="{ opt }">
                    <span class="text-white">{{ opt.label }}</span>
                  </template>
                </q-select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Mostrar rostro</label>
                <q-toggle v-model="displayFace" name="displayFace" color="yellow-400" dense />
              </div>
            </div>
          </q-card>
          <budget-card-mini
            :total-cost="totalCost"
            :remaining-budget="remainingBudget"
            :budget-amount="budgetAmount"
            :currency-option="currentCurrency"
            :formatter="currentCurrency.formatter"
          />
          <q-btn dense size="md" color="primary" class="w-full" @click="$emit('start:building')">
            <q-icon name="fa fa-arrow-right" size="xs" class="mr-2" />
            ¡Crear mi primera alineación!
          </q-btn>
          <q-btn
            dense
            outline
            size="md"
            color="secondary"
            class="w-full text-white"
            @click="$emit('reset:building')"
          >
            <q-icon name="fa fa-refresh" size="xs" class="mr-2" />
            Reiniciar
          </q-btn>
        </div>

        <!-- Football Field -->
        <div class="lg:col-span-2">
          <q-card class="bg-slate-800/50 border border-blue-500/20 backdrop-blur-sm p-6 h-fit">
            <demo-field
              :lineup="lineup"
              :field-positions="currentFieldPositions"
              :selected-league="selectedLeague"
              :demo-players="demoPlayers"
              :bench="bench"
              :selected-slot="selectedSlotId"
              :formatter="currentCurrency.formatter"
              @remove-player="removePlayer"
              @remove-bench-player="removeBenchPlayer"
              @swap-players="handleSwapPlayers"
              @auto-fill-bench="handleAutoFillBench"
              @clear-bench="handleClearBench"
              @click-field-slot="openPlayerSelection"
              @click-bench-slot="openBenchSelection"
              @deselect-field-slot="deselectField('field')"
              @deselect-bench-slot="deselectField('bench')"
              @drop-field-player="onDropFieldPlayer"
              @drop-bench-player="onDropBenchPlayer"
              @update:salary="onPlayerSalaryUpdate"
            />
          </q-card>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useSharedPlayerSearch } from 'src/modules/players/composables/usePlayerSearch';
import { useSharedDemoBuilder } from 'src/modules/home/composables/useDemoBuilder';
import { BudgetCardMini } from 'src/modules/budget/components/BudgetCard';
import { DemoField } from 'src/modules/lineup-builder/components/LineupField';
import { FORMATION_OPTIONS as formationOptions } from 'src/modules/lineup-builder/components/LineupField';
import {
  LEAGUE_OPTIONS as leagueOptions,
  CURRENCY_OPTIONS as currencyOptions,
} from 'src/modules/home/components/HomeDemoBuilder';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';
import type { PlayerPositionAbbreviation } from 'src/modules/players/domain/value-objects/player-position.enum';

interface Props {
  demoPlayers: PlayerDto[];
}

// Emits
const emit = defineEmits([
  'start:building',
  'reset:building',
  'update:lineup',
  'update:bench',
  'remove:player',
  'remove:bench-player',
  'replace:lineup',
  'replace:bench',
  'open-dialog:player',
  'open-dialog:bench',
]);

const props = defineProps<Props>();

// Composables
const {
  lineup,
  bench,
  draggedPlayer,
  remainingBudget,
  budgetAmount,
  displayFace,
  totalCost,
  selectedSlotId,
  selectedSlotType,
  selectedSlotPosition,
  selectedCurrency,
  currentCurrency,
  selectedLeagueValue,
  selectedLeague,
  selectedFormation,
  currentFieldPositions,
  resetBench,
  resetLineup,
  updatePlayerMarketValue,
  resetSelectedSlot,
  selectPlayer,
  canSelectPlayer,
} = useSharedDemoBuilder();

const { clearEngine, clearSearch, refreshCache, initializeSearch } = useSharedPlayerSearch();

watch(
  selectedLeagueValue,
  async (newLeagueValue, oldLeagueValue) => {
    if (newLeagueValue !== oldLeagueValue) {
      resetBench();
      resetLineup();
      clearEngine();
      clearSearch();
      refreshCache();
    }

    await initializeSearch(props.demoPlayers);
  },
  {
    immediate: true,
  },
);

// Dialog Methods
const openPlayerSelection = (slotId: string, position: PlayerPositionAbbreviation) => {
  emit('open-dialog:player', slotId, position);
};

const openBenchSelection = (slotId: string) => {
  emit('open-dialog:bench', slotId);
};

// Methods
const onDropPlayer = (
  slotId: string,
  slotType: 'field' | 'bench',
  position: PlayerPositionAbbreviation,
) => {
  if (draggedPlayer.value) {
    if (canSelectPlayer(draggedPlayer.value)) {
      selectedSlotId.value = slotId;
      selectedSlotType.value = slotType;
      selectedSlotPosition.value = position;
    }
    selectPlayer(draggedPlayer.value, position);
    draggedPlayer.value = null;
  }
};

const onDropBenchPlayer = (slotId: string, position: PlayerPositionAbbreviation) => {
  onDropPlayer(slotId, 'bench', position);
};

const onDropFieldPlayer = (slotId: string, position: PlayerPositionAbbreviation) => {
  onDropPlayer(slotId, 'field', position);
};

const deselectField = (slotType: 'field' | 'bench' = 'field') => {
  resetSelectedSlot(slotType);
};

const onPlayerSalaryUpdate = (slotId: string, slotType: 'field' | 'bench', salary: number) => {
  updatePlayerMarketValue(slotId, slotType, salary || 0);
};

const removePlayer = (positionId: string) => {
  emit('remove:player', positionId);
};

const removeBenchPlayer = (slotId: string) => {
  emit('remove:bench-player', slotId);
};

const isPlayerInFieldOrBench = (fieldOrBench: Record<string, PlayerDto>) => (player: PlayerDto) =>
  Object.values(fieldOrBench).some((p) => p && p.id === player.id);

const isPlayerInField = isPlayerInFieldOrBench(lineup.value);
const isPlayerInBench = isPlayerInFieldOrBench(bench.value);

const handleSwapPlayers = (benchSlotId: string, fieldPositionId: string) => {
  const benchPlayer = bench.value[benchSlotId];
  const fieldPlayer = lineup.value[fieldPositionId];

  const fieldPos = currentFieldPositions.value.find((p) => p.id === fieldPositionId);
  if (benchPlayer && fieldPos && benchPlayer.position === fieldPos.position) {
    const newLineup = { ...lineup.value };
    const newBench = { ...bench.value };

    newLineup[fieldPositionId] = benchPlayer;
    if (fieldPlayer) {
      newBench[benchSlotId] = fieldPlayer;
    } else {
      delete newBench[benchSlotId];
    }

    emit('replace:lineup', newLineup);
    emit('replace:bench', newBench);
  }
};

const handleAutoFillBench = () => {
  const availablePlayers = props.demoPlayers.filter((player) => {
    return (
      !isPlayerInField(player) &&
      !isPlayerInBench(player) &&
      (player.marketValue || 0) <= remainingBudget.value
    );
  });

  const emptyBenchSlots = ['bench1', 'bench2', 'bench3', 'bench4', 'bench5'].filter(
    (slotId) => !bench.value[slotId],
  );

  // Fill with best available players
  const sortedPlayers = availablePlayers.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const newBench = { ...bench.value };

  emptyBenchSlots.forEach((slotId, index) => {
    if (sortedPlayers[index]) {
      newBench[slotId] = sortedPlayers[index];
    }
  });

  emit('replace:bench', newBench);
};

const handleClearBench = () => {
  emit('replace:bench', {});
};
</script>
