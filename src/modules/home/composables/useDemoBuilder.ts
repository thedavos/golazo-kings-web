import { computed, ref } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import {
  CURRENCY_OPTION_DEFAULT as currencyOptionDefault,
  CURRENCY_OPTIONS as currencyOptions,
  LEAGUE_OPTION_DEFAULT as leagueOptionDefault,
  LEAGUE_OPTIONS as leagueOptions,
  kingsPlayersData,
  queensPlayersData,
  type CurrencyOption,
  type LeagueOption,
} from 'src/modules/home/components/HomeDemoBuilder';
import { FORMATION_CONFIGURATION as formationConfiguration } from 'src/modules/lineup-builder/components/LineupField';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';
import type { PlayerPositionAbbreviation } from 'src/modules/players/domain/value-objects/player-position.enum';
import type { FormationName } from 'src/modules/lineup-builder/components/LineupField';

function useDemoBuilder() {
  const lineup = ref<Record<string, PlayerDto>>({});
  const bench = ref<Record<string, PlayerDto>>({});
  const budgetAmount = ref(4000);
  const selectedCurrency = ref('EUR');
  const selectedLeagueValue = ref<string>(leagueOptionDefault.value);
  const selectedFormation = ref<FormationName>('3-2-1');
  const selectedSlotId = ref<string | null>(null);
  const selectedSlotPosition = ref<PlayerPositionAbbreviation | null>(null);
  const selectedSlotType = ref<'field' | 'bench'>('field');
  const displayFace = ref(false);

  const demoPlayers = computed(() => {
    if (selectedLeague.value.type === 'kings') {
      const players = [...kingsPlayersData] as PlayerDto[];

      return players.filter((player) =>
        selectedLeague.value.value === 'kings'
          ? true
          : player.league === selectedLeague.value.label,
      );
    }

    const queensPlayers = [...queensPlayersData] as PlayerDto[];

    return queensPlayers.filter((player) =>
      selectedLeague.value.value === 'queens' ? true : player.league === selectedLeague.value.label,
    );
  });

  const currentFieldPositions = computed(() => {
    return formationConfiguration[selectedFormation.value] || formationConfiguration['3-2-1'];
  });

  const selectedLeague = computed<LeagueOption>(
    () =>
      leagueOptions.find((league) => league.value === selectedLeagueValue.value) ||
      leagueOptionDefault,
  );

  const currentCurrency = computed<CurrencyOption>(() => {
    const currency = currencyOptions.find((c) => c.value === selectedCurrency.value);
    return currency || currencyOptionDefault;
  });

  const remainingBudget = computed(() => {
    return budgetAmount.value - totalCost.value;
  });

  const totalCost = computed(() => {
    const lineupCost = Object.values(lineup.value).reduce(
      (sum, player) => sum + (player?.marketValue || 0),
      0,
    );
    const benchCost = Object.values(bench.value).reduce(
      (sum, player) => sum + (player?.marketValue || 0),
      0,
    );

    return lineupCost + benchCost;
  });

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

  const resetLineup = () => {
    lineup.value = {};
  };

  const resetBench = () => {
    bench.value = {};
  };

  const onPlayerSelected = (player: PlayerDto) => {
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

  return {
    demoPlayers,
    lineup,
    bench,
    selectedCurrency,
    budgetAmount,
    remainingBudget,
    totalCost,
    selectedSlotId,
    selectedSlotPosition,
    selectedSlotType,
    selectedFormation,
    selectedLeagueValue,
    displayFace,

    // Computed
    currentCurrency,
    selectedLeague,
    currentFieldPositions,

    //   Methods
    updateLineup,
    updateBench,
    replaceLineup,
    replaceBench,
    resetLineup,
    resetBench,
    onPlayerSelected,
  };
}

export const useSharedDemoBuilder = createSharedComposable(useDemoBuilder);
