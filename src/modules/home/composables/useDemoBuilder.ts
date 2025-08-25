import { computed, ref } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import { useQuasar } from 'quasar';
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
  const draggedPlayer = ref<PlayerDto | null>(null);

  const $q = useQuasar();

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

  const allSelectedPlayers = computed(() => {
    return [
      ...Object.values(lineup.value).filter(Boolean),
      ...Object.values(bench.value).filter(Boolean),
    ];
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

  const resetSelectedSlot = (slotType: 'field' | 'bench' = 'field') => {
    selectedSlotId.value = null;
    selectedSlotPosition.value = null;
    selectedSlotType.value = slotType;
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

  const resetLineup = () => {
    lineup.value = {};
  };

  const resetBench = () => {
    bench.value = {};
  };

  const updateLineupPlayerProperty = <K extends keyof PlayerDto>(
    positionId: string,
    property: K,
    value: PlayerDto[K],
  ) => {
    if (lineup.value[positionId]) {
      const currentPlayer = lineup.value[positionId];
      const updatedPlayer = { ...currentPlayer, [property]: value };

      lineup.value = {
        ...lineup.value,
        [positionId]: updatedPlayer,
      };
    }
  };

  const updateBenchPlayerProperty = <K extends keyof PlayerDto>(
    slotId: string,
    property: K,
    value: PlayerDto[K],
  ) => {
    if (bench.value[slotId]) {
      const currentPlayer = bench.value[slotId];
      const updatedPlayer = { ...currentPlayer, [property]: value };

      bench.value = {
        ...bench.value,
        [slotId]: updatedPlayer,
      };
    }
  };

  const updateLineupPlayerProperties = (positionId: string, properties: Partial<PlayerDto>) => {
    if (lineup.value[positionId]) {
      const currentPlayer = lineup.value[positionId];
      const updatedPlayer = { ...currentPlayer, ...properties };

      lineup.value = {
        ...lineup.value,
        [positionId]: updatedPlayer,
      };
    }
  };

  const updateBenchPlayerProperties = (slotId: string, properties: Partial<PlayerDto>) => {
    if (bench.value[slotId]) {
      const currentPlayer = bench.value[slotId];
      const updatedPlayer = { ...currentPlayer, ...properties };

      bench.value = {
        ...bench.value,
        [slotId]: updatedPlayer,
      };
    }
  };

  const getLineupPlayer = (positionId: string): PlayerDto | undefined => {
    return lineup.value[positionId];
  };

  const getBenchPlayer = (slotId: string): PlayerDto | undefined => {
    return bench.value[slotId];
  };

  const updatePlayerMarketValue = (
    slotId: string,
    slotType: 'field' | 'bench',
    marketValue: number,
  ) => {
    if (slotType === 'field') {
      updateLineupPlayerProperty(slotId, 'marketValue', marketValue);
    } else {
      updateBenchPlayerProperty(slotId, 'marketValue', marketValue);
    }
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

  const canSelectPlayer = (player: PlayerDto): boolean => {
    // Check if a player is already selected
    const isAlreadySelected = allSelectedPlayers.value.some((p) => p.id === player.id);
    if (isAlreadySelected) return false;

    // Check budget
    const exceedsBudget = (player.marketValue || 0) > remainingBudget.value;
    if (exceedsBudget) return false;

    // Check position compatibility (if required)
    return true;
  };

  const selectPlayer = (player: PlayerDto, requiredPosition: PlayerPositionAbbreviation) => {
    if (!canSelectPlayer(player))
      return $q.notify({
        message: getPlayerAlert(player, requiredPosition),
        position: 'bottom-left',
        color: 'primary',
        timeout: 2500,
      });

    onPlayerSelected(player);
  };

  const getPlayerAlert = (
    player: PlayerDto,
    requiredPosition: PlayerPositionAbbreviation,
  ): string => {
    const isAlreadySelected = allSelectedPlayers.value.some((p) => p.id === player.id);
    if (isAlreadySelected)
      return player.isQueensLeaguePlayer
        ? 'La jugadora ya está seleccionada'
        : 'El jugador ya está seleccionado';

    const exceedsBudget = (player.marketValue || 0) > remainingBudget.value;
    if (exceedsBudget)
      return `Te quedaste sin presupuesto para armar tu equipo, ajusta o descarta a ${player.isQueensLeaguePlayer ? 'alguna jugadora' : 'algún jugador'}`;

    if (requiredPosition && player.positionAbbreviation !== requiredPosition) {
      return `Posición incorrecta para ${player.isQueensLeaguePlayer ? 'la jugadora' : 'el jugador'}`;
    }

    return 'Disponible';
  };

  return {
    demoPlayers,
    lineup,
    bench,
    draggedPlayer,
    selectedCurrency,
    budgetAmount,
    remainingBudget,
    totalCost,
    selectedSlotId,
    selectedSlotPosition,
    selectedSlotType,
    selectedFormation,
    selectedLeagueValue,

    // Computed
    currentCurrency,
    selectedLeague,
    currentFieldPositions,

    //   Methods
    resetSelectedSlot,
    updateLineup,
    updateBench,
    replaceLineup,
    replaceBench,
    resetLineup,
    resetBench,
    onPlayerSelected,
    updateLineupPlayerProperty,
    updateBenchPlayerProperty,
    updateLineupPlayerProperties,
    updateBenchPlayerProperties,
    updatePlayerMarketValue,
    getLineupPlayer,
    getBenchPlayer,
    selectPlayer,
    canSelectPlayer,
    getPlayerAlert,
  };
}

export const useSharedDemoBuilder = createSharedComposable(useDemoBuilder);
