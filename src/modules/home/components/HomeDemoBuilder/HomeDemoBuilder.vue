<template>
  <section class="py-16 bg-gradient-to-br from-slate-800/50 to-slate-900/30">
    <div class="container mx-auto px-6">
      <div class="text-center mb-12">
        <h2 class="text-4xl text-primary font-bold mb-4">Demo Interactivo</h2>
        <p class="text-xl text-gray-300 mb-2">¡Prueba el constructor ahora sin registrarte!</p>
        <p class="text-lg text-blue-400">
          Forma tu plantilla completa con 7 titulares + 5 suplentes. Presupuesto:
          {{ props.currentCurrency.formatter(budgetAmount) }}
        </p>
      </div>

      <div class="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        <!-- Football Field -->
        <div class="lg:col-span-2">
          <q-card class="bg-slate-800/50 border border-blue-500/20 backdrop-blur-sm p-6 h-fit">
            <demo-field
              :lineup="lineup"
              :field-positions="currentFieldPositions"
              :selected-league="selectedLeague"
              :demo-players="demoPlayers"
              :bench="bench"
              @drop-player="handleDrop"
              @remove-player="removePlayer"
              @drop-bench-player="handleBenchDrop"
              @remove-bench-player="removeBenchPlayer"
              @swap-players="handleSwapPlayers"
              @auto-fill-bench="handleAutoFillBench"
              @clear-bench="handleClearBench"
              @click-field-slot="openPlayerSelection"
              @click-bench-slot="openBenchSelection"
            />
          </q-card>
        </div>

        <!-- Budget & Stats -->
        <div class="lg:col-span-1 space-y-4">
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
                    :mask="props.currentCurrency.mask"
                    :rules="[(val) => val > 0 || 'El presupuesto debe ser mayor a 0']"
                  >
                    <template #prepend>
                      <span v-if="props.currentCurrency" class="text-yellow-400 font-semibold">{{
                        props.currentCurrency.symbol
                      }}</span>
                    </template>
                  </q-input>
                </div>
                <div class="mt-1 text-xs text-gray-400">
                  Presupuesto: {{ props.currentCurrency.formatter(budgetAmount) }}
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
            </div>
          </q-card>
          <budget-card-mini
            :total-cost="totalCost"
            :remaining-budget="remainingBudget"
            :budget-amount="budgetAmount"
            :currency-option="props.currentCurrency"
            :formatter="props.currentCurrency.formatter"
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
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, useModel } from 'vue';
import { useSharedDemoBuilder } from 'src/modules/home/composables/useDemoBuilder';
import { BudgetCardMini } from 'src/modules/budget/components/BudgetCard';
import { DemoField } from 'src/modules/lineup-builder/components/LineupField';
import {
  FORMATION_CONFIGURATION as formationConfiguration,
  FORMATION_OPTIONS as formationOptions,
} from 'src/modules/lineup-builder/components/LineupField';
import {
  LEAGUE_OPTIONS as leagueOptions,
  LEAGUE_OPTION_DEFAULT as leagueOptionDefault,
  CURRENCY_OPTIONS as currencyOptions,
} from 'src/modules/home/components/HomeDemoBuilder';
import type { LeagueOption, CurrencyOption } from 'src/modules/home/components/HomeDemoBuilder';
import type { FormationName } from 'src/modules/lineup-builder/components/LineupField';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';
import type { PlayerPosition } from 'src/modules/players/domain/value-objects/player-position.enum';

interface Props {
  demoPlayers: PlayerDto[];
  currentCurrency: CurrencyOption;
  selectedCurrency: string;
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
const { lineup, bench, remainingBudget, budgetAmount, totalCost } = useSharedDemoBuilder();

// Reactive state
const selectedLeagueValue = ref<string>(leagueOptionDefault.value);
const selectedFormation = ref<FormationName>('4-2-0');
const draggedPlayer = ref<PlayerDto | null>(null);

// useModel
const selectedCurrency = useModel(props, 'selectedCurrency');

// Computed properties
const selectedLeague = computed<LeagueOption>(
  () =>
    leagueOptions.find((league) => league.value === selectedLeagueValue.value) ||
    leagueOptionDefault,
);

const currentFieldPositions = computed(() => {
  return formationConfiguration[selectedFormation.value] || formationConfiguration['4-2-0'];
});

// Dialog Methods
const openPlayerSelection = (slotId: string, position: PlayerPosition) => {
  emit('open-dialog:player', slotId, position);
};

const openBenchSelection = (slotId: string) => {
  emit('open-dialog:bench', slotId);
};

// Methods
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

const handleDrop = (positionId: string, position: PlayerPosition) => {
  if (draggedPlayer.value && draggedPlayer.value.position === position) {
    if (!isPlayerInField(draggedPlayer.value) && !isPlayerInBench(draggedPlayer.value)) {
      emit('update:lineup', positionId, draggedPlayer.value);
    }

    draggedPlayer.value = null;
  }
};

const handleBenchDrop = (slotId: string) => {
  if (draggedPlayer.value) {
    if (!isPlayerInField(draggedPlayer.value) && !isPlayerInBench(draggedPlayer.value)) {
      emit('update:bench', slotId, draggedPlayer.value);
    }

    draggedPlayer.value = null;
  }
};

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
