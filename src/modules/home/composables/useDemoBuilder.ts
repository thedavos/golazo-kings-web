import { computed, ref } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import { useQuasar } from 'quasar';
import {
  CURRENCY_OPTION_DEFAULT as currencyOptionDefault,
  CURRENCY_OPTIONS as currencyOptions,
  LEAGUE_OPTION_DEFAULT as leagueOptionDefault,
  LEAGUE_OPTIONS as leagueOptions,
  type CurrencyOption,
  type LeagueOption,
} from 'src/modules/home/components/HomeDemoBuilder';
import { kingsPlayersData, queensPlayersData } from 'src/modules/home/data';
import { findClosest } from 'src/modules/shared/utils/findClosest.util';
import { FORMATION_CONFIGURATION as formationConfiguration } from 'src/modules/lineup-builder/constants/formation.constant';
import {
  PlayerPositionAbbreviation,
  PlayerPosition,
} from 'src/modules/players/domain/value-objects/player-position.enum';
import type {
  FormationName,
  FieldPositions,
  FieldPosition,
} from 'src/modules/lineup-builder/types';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';

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
  const draggedFromField = ref<{
    player: PlayerDto | null;
    positionId: string;
    isEmpty: boolean;
  } | null>(null);

  // Custom positioning state
  const customPlayerPositions = ref<Record<string, { x: number; y: number }>>({});
  const isCustomFormation = ref(false);
  // Track the last predefined formation used before switching to custom
  const lastPredefinedFormation = ref<FormationName>('3-2-1');

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

  const lineupPlayers = computed(() => Object.values(lineup.value).filter(Boolean));

  const currentFieldPositions = computed<FieldPositions>(() => {
    if (selectedFormation.value === 'Personalizado' || isCustomFormation.value) {
      // Get the base formation to maintain empty slots
      const baseFormationKey =
        lastPredefinedFormation.value !== 'Personalizado'
          ? lastPredefinedFormation.value
          : ('3-2-1' as const);
      const baseFormation =
        formationConfiguration[baseFormationKey] || formationConfiguration['3-2-1'];

      // Start with all positions from the base formation
      const positions = [] as FieldPositions;

      // Include all base formation positions (maintaining empty slots)
      for (const basePos of baseFormation) {
        // Check if this position has custom coordinates
        const customCoords = customPlayerPositions.value[basePos.id];
        if (customCoords) {
          const player = lineup.value[basePos.id];
          positions.push({
            id: basePos.id,
            x: customCoords.x,
            y: customCoords.y,
            position: (player?.position as PlayerPosition) || basePos.position,
            abbreviation:
              (player?.positionAbbreviation as PlayerPositionAbbreviation) || basePos.abbreviation,
          });
        } else {
          // Keep the original formation position (empty or occupied)
          const player = lineup.value[basePos.id];
          positions.push({
            id: basePos.id,
            x: basePos.x,
            y: basePos.y,
            position: (player?.position as PlayerPosition) || basePos.position,
            abbreviation:
              (player?.positionAbbreviation as PlayerPositionAbbreviation) || basePos.abbreviation,
          });
        }
      }

      // Include any additional custom positions (newly created during drag operations)
      for (const [positionId, coordinates] of Object.entries(customPlayerPositions.value)) {
        // Only add if it's not already included from base formation
        if (!baseFormation.some((pos) => pos.id === positionId)) {
          const player = lineup.value[positionId];
          positions.push({
            id: positionId,
            x: coordinates.x,
            y: coordinates.y,
            position: (player?.position as PlayerPosition) || PlayerPosition.MEDIO_CENTRO,
            abbreviation:
              (player?.positionAbbreviation as PlayerPositionAbbreviation) ||
              PlayerPositionAbbreviation.MC,
          });
        }
      }

      return positions;
    }

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
      if (isPositionEmpty(selectedSlotId.value) || lineupPlayers.value.length === 7) {
        updateLineup(selectedSlotId.value, player);
      } else {
        const emptyPositions = [...currentFieldPositions.value].filter((position) =>
          isPositionEmpty(position.id),
        );
        const targetPosition = currentFieldPositions.value.find(
          (position) => position.id === selectedSlotId.value,
        ) as FieldPosition;
        const closestPosition = findClosest(
          targetPosition?.x,
          targetPosition?.y,
          emptyPositions,
          'x',
          'y',
        ) as FieldPosition;
        selectedSlotId.value = closestPosition.id;
        selectedSlotPosition.value = closestPosition.abbreviation;

        updateLineup(selectedSlotId.value, player);
      }
    } else {
      updateBench(selectedSlotId.value, player);
    }
  };

  const isPlayerInPosition = (player: PlayerDto, positionId: string): boolean => {
    return lineup.value[positionId]?.id === player.id;
  };

  const isPositionEmpty = (positionId: string): boolean => {
    return !lineup.value[positionId];
  };

  const canDropPlayer = (player: PlayerDto): boolean => {
    return lineupPlayers.value.length < 7 && canSelectPlayer(player);
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

  const getPlayerAlert = (player: PlayerDto): string => {
    if (lineupPlayers.value.length >= 7) {
      return 'El campo de juego solo puede tener 7 jugadores';
    }

    const isAlreadySelected = allSelectedPlayers.value.some((p) => p.id === player.id);
    if (isAlreadySelected)
      return player.isQueensLeaguePlayer
        ? 'La jugadora ya está seleccionada'
        : 'El jugador ya está seleccionado';

    const exceedsBudget = (player.marketValue || 0) > remainingBudget.value;
    if (exceedsBudget)
      return `Te quedaste sin presupuesto para armar tu equipo, ajusta o descarta a ${player.isQueensLeaguePlayer ? 'alguna jugadora' : 'algún jugador'}`;

    return 'Disponible';
  };

  // Custom positioning methods
  const dropPlayerAtCustomCoordinates = (x: number, y: number) => {
    if (!draggedPlayer.value) return;
    if (!canDropPlayer(draggedPlayer.value))
      return $q.notify({
        message: getPlayerAlert(draggedPlayer.value),
        position: 'bottom-left',
        color: 'primary',
        timeout: 2500,
      });

    if (selectedSlotId.value && !isPositionEmpty(selectedSlotId.value)) {
      const emptyPositions = [...currentFieldPositions.value].filter((position) =>
        isPositionEmpty(position.id),
      );

      const closestPosition = findClosest(x, y, emptyPositions, 'x', 'y') as FieldPosition;

      selectedSlotId.value = closestPosition.id;
      selectedSlotPosition.value = closestPosition.abbreviation;

      updateLineup(closestPosition.id, draggedPlayer.value);
    } else if (selectedSlotId.value) {
      updateLineup(selectedSlotId.value, draggedPlayer.value);
    } else {
      const emptyPositions = [...currentFieldPositions.value].filter((position) =>
        isPositionEmpty(position.id),
      );
      const closestPosition = findClosest(x, y, emptyPositions, 'x', 'y') as FieldPosition;

      selectedSlotId.value = closestPosition.id;
      selectedSlotPosition.value = closestPosition.abbreviation;

      updateLineup(selectedSlotId.value, draggedPlayer.value);
    }

    // Store custom coordinates
    customPlayerPositions.value[selectedSlotId.value] = { x, y };

    // Switch to custom formation if not already
    if (selectedFormation.value !== 'Personalizado') {
      lastPredefinedFormation.value = selectedFormation.value;
      selectedFormation.value = 'Personalizado';
      isCustomFormation.value = true;
    }

    draggedFromField.value = {
      player: draggedPlayer.value,
      positionId: selectedSlotId.value,
      isEmpty: false,
    };

    // Reset dragged player
    draggedPlayer.value = null;

    if (selectedSlotId.value) {
      moveFieldPlayerToPosition(selectedSlotId.value);
    }
  };

  const changeFormation = (newFormation: FormationName) => {
    if (newFormation === 'Personalizado') {
      // Don't allow direct selection of Personalizado
      return;
    }

    // Store current formation as last predefined formation if it's not custom
    if (selectedFormation.value !== 'Personalizado') {
      lastPredefinedFormation.value = selectedFormation.value;
    }

    selectedFormation.value = newFormation;
    isCustomFormation.value = false;

    // Clear custom positions when switching to predefined formation
    customPlayerPositions.value = {};

    // Move all players to new formation positions if they exist
    const newPositions = formationConfiguration[newFormation];
    const currentPlayers = Object.values(lineup.value).filter(Boolean);

    // Clear current lineup
    lineup.value = {};

    // Reassign players to new formation positions
    currentPlayers.forEach((player, index) => {
      if (newPositions[index]) {
        lineup.value[newPositions[index].id] = player;
      }
    });
  };

  const movePlayerToCustomPosition = (playerId: string, x: number, y: number) => {
    customPlayerPositions.value[playerId] = { x, y };

    // Switch to custom formation
    if (selectedFormation.value !== 'Personalizado') {
      lastPredefinedFormation.value = selectedFormation.value;
      selectedFormation.value = 'Personalizado';
      isCustomFormation.value = true;
    }
  };

  const startFieldPlayerDrag = (player: PlayerDto | null, positionId: string, isEmpty = false) => {
    draggedFromField.value = { player, positionId, isEmpty };
    draggedPlayer.value = null; // Clear any sidebar drag state
  };

  const endFieldPlayerDrag = () => {
    draggedFromField.value = null;
  };

  const moveFieldPlayerToCustomCoordinates = (x: number, y: number) => {
    if (!draggedFromField.value) return;
    const { positionId } = draggedFromField.value;

    // If dragging a slot, move the original slot to new coordinates
    // Store new custom coordinates for the existing slot (don't create new ID)
    customPlayerPositions.value[positionId] = { x, y };

    // Switch to custom formation if not already
    if (selectedFormation.value !== 'Personalizado') {
      lastPredefinedFormation.value = selectedFormation.value;
      selectedFormation.value = 'Personalizado';
      isCustomFormation.value = true;
    }

    // Reset dragged state
    draggedFromField.value = null;
  };

  const moveFieldPlayerToPosition = (targetPositionId: string) => {
    if (!draggedFromField.value || draggedFromField.value?.positionId === targetPositionId) return;
    const { player, positionId: sourcePositionId, isEmpty } = draggedFromField.value;

    // Check if target position is occupied
    const targetPlayer = lineup.value[targetPositionId];

    const updatedLineup = { ...lineup.value };

    // Handle empty slot drag - just move the slot without affecting players
    if (isEmpty || !player) {
      // For empty slots, we don't need to move anything in the lineup
      // The visual position change will be handled by the coordinates
      draggedFromField.value = null;
      return;
    }

    // Remove player from source position
    delete updatedLineup[sourcePositionId];

    // If source was custom position, remove its coordinates
    if (customPlayerPositions.value[sourcePositionId]) {
      const updatedCustomPositions = { ...customPlayerPositions.value };
      delete updatedCustomPositions[sourcePositionId];
      customPlayerPositions.value = updatedCustomPositions;
    }

    // If target position is occupied, swap players
    if (targetPlayer) {
      updatedLineup[sourcePositionId] = targetPlayer;
    }

    // Place dragged player in target position
    updatedLineup[targetPositionId] = player;

    lineup.value = updatedLineup;

    // Reset dragged state
    draggedFromField.value = null;
  };

  return {
    demoPlayers,
    lineup,
    bench,
    draggedPlayer,
    draggedFromField,
    selectedCurrency,
    budgetAmount,
    remainingBudget,
    totalCost,
    selectedSlotId,
    selectedSlotPosition,
    selectedSlotType,
    selectedFormation,
    selectedLeagueValue,
    customPlayerPositions,
    isCustomFormation,
    lastPredefinedFormation,

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
    isPlayerInPosition,
    getPlayerAlert,
    dropPlayerAtCustomCoordinates,
    changeFormation,
    movePlayerToCustomPosition,
    startFieldPlayerDrag,
    endFieldPlayerDrag,
    moveFieldPlayerToCustomCoordinates,
    moveFieldPlayerToPosition,
  };
}

export const useSharedDemoBuilder = createSharedComposable(useDemoBuilder);
