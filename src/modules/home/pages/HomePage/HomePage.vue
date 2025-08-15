<template>
  <q-page>
    <home-hero />
    <home-demo-builder
      :demo-players="demoPlayers"
      :current-currency="currentCurrency"
      :selected-currency="selectedCurrency"
      @update:lineup="updateLineup"
      @update:bench="updateBench"
      @remove:player="removePlayer"
      @remove:bench-player="removeBenchPlayer"
      @replace:lineup="replaceLineup"
      @replace:bench="replaceBench"
      @open-dialog:player="openPlayerDialog"
      @open-dialog:bench="openBenchDialog"
    />

    <player-simple-dialog
      v-model="showPlayerDialog"
      :players="demoPlayers"
      :selected-players="allSelectedPlayers"
      :remaining-budget="remainingBudget"
      :formatter="currentCurrency.formatter"
      :required-position="selectedSlotPosition"
      @player-selected="handlePlayerSelected"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useSharedDemoBuilder } from 'src/modules/home/composables/useDemoBuilder';
import {
  CURRENCY_OPTION_DEFAULT as currencyOptionDefault,
  CURRENCY_OPTIONS as currencyOptions,
  HomeDemoBuilder,
  type CurrencyOption,
} from 'src/modules/home/components/HomeDemoBuilder';
import { HomeHero } from 'src/modules/home/components/HomeHero';
import { PlayerSimpleDialog } from 'src/modules/players/dialogs/PlayerSimpleDialog';
import { kingsPlayersData } from 'src/modules/home/components/HomeDemoBuilder';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';
import type { PlayerPosition } from 'src/modules/players/domain/value-objects/player-position.enum';

// Reactive state
const selectedCurrency = ref('EUR');

// Reactive dialog state
const showPlayerDialog = ref(false);
const selectedSlotId = ref<string | null>(null);
const selectedSlotPosition = ref<PlayerPosition | null>(null);
const selectedSlotType = ref<'field' | 'bench'>('field');

// Composables
const { lineup, bench, remainingBudget } = useSharedDemoBuilder();

// Demo data
const demoPlayers = [...(kingsPlayersData as PlayerDto[])];

// Computed
const currentCurrency = computed<CurrencyOption>(() => {
  const currency = currencyOptions.find((c) => c.value === selectedCurrency.value);
  return currency || currencyOptionDefault;
});

const allSelectedPlayers = computed(() => {
  return [
    ...Object.values(lineup.value).filter(Boolean),
    ...Object.values(bench.value).filter(Boolean),
  ];
});

// Methods
const handlePlayerSelected = (player: PlayerDto) => {
  if (!selectedSlotId.value) return;

  // Add player to appropriate slot
  if (selectedSlotType.value === 'field') {
    updateLineup(selectedSlotId.value, player);
  } else {
    updateBench(selectedSlotId.value, player);
  }

  // Reset dialog state
  selectedSlotId.value = null;
  selectedSlotPosition.value = null;
};

const updateLineup = (positionId: string, draggedPlayer: PlayerDto) => {
  lineup.value = { ...lineup.value, [positionId]: draggedPlayer };
};

const updateBench = (slotId: string, benchPlayer: PlayerDto) => {
  bench.value = { ...bench.value, [slotId]: benchPlayer };
};

const replaceLineup = (newLineup: Record<string, PlayerDto>) => {
  lineup.value = { ...newLineup };
};

const replaceBench = (newBench: Record<string, PlayerDto>) => {
  bench.value = { ...newBench };
};

const removeBenchPlayer = (slotId: string) => {
  const newBench = { ...bench.value };
  delete newBench[slotId];
  replaceBench(newBench);
};

const removePlayer = (positionId: string) => {
  const newLineup = { ...lineup.value };
  delete newLineup[positionId];
  replaceLineup(newLineup);
};

const openPlayerDialog = (slotId: string, position: PlayerPosition) => {
  console.log('openPlayerDialog: ', slotId, position);
  selectedSlotId.value = slotId;
  selectedSlotPosition.value = position;
  selectedSlotType.value = 'field';
  showPlayerDialog.value = true;
};

const openBenchDialog = (slotId: string) => {
  selectedSlotId.value = slotId;
  selectedSlotPosition.value = null;
  selectedSlotType.value = 'bench';
  showPlayerDialog.value = true;
};
</script>
