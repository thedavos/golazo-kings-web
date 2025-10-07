import { computed, ref, watch } from 'vue';
import { acceptHMRUpdate, defineStore } from 'pinia';
import { CONST } from 'src/modules/lineup-builder/constants';
import { allPlayers } from 'src/modules/home/data';
import { getDisplayName } from 'src/modules/shared/utils/getDisplayName.util';
import type {
  CurrencyOption,
  FormationOption,
  Filter,
  LineupPlayer,
  PlayerSlot,
  FieldSlot,
} from 'src/modules/lineup-builder/types';
import type { OrderBySelectOption } from 'src/modules/lineup-builder/constants/orderBy.constant';
import type { TeamSelectOption } from 'src/modules/lineup-builder/constants/team.constant';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';
import type { CoachSelectOption } from 'src/modules/lineup-builder/constants/coach.constant';
import type { PlayerPositionAbbreviation } from 'src/modules/players/domain/value-objects/player-position.enum';

export const useLineupStore = defineStore(
  'lineup',
  () => {
    const lineupName = ref('');
    const lineupTeam = ref<TeamSelectOption | null>(null);
    const lineupCoach = ref<CoachSelectOption | null>(null);
    const showTeamInLineup = ref(false);
    const showCoachInLineup = ref(false);
    const lineupPlayers = ref<LineupPlayer[]>([]);
    const lineupFieldSlots = ref<Map<string, FieldSlot>>(CONST.LINEUP.PLAYER_IN_FIELD_SLOTS);
    const lineupBenchSlots = ref<PlayerSlot[]>(CONST.LINEUP.PLAYER_IN_BENCH_SLOTS);
    const budget = ref(CONST.BUDGET.DEFAULT_TOTAL);
    const formation = ref<FormationOption>(CONST.FORMATION.DEFAULT_FORMATION);
    const currency = ref<CurrencyOption>(CONST.CURRENCY.DEFAULT_OPTION);
    const filters = ref<Filter>({
      league: CONST.LEAGUE.DEFAULT_OPTION,
      team: CONST.TEAM.DEFAULT_OPTION,
      position: CONST.PLAYER_POSITION.DEFAULT_OPTION,
    });
    const orderBy = ref<OrderBySelectOption>(CONST.ORDER_BY.DEFAULT);
    const playersModified = ref<PlayerDto[]>([]);

    const players = computed<PlayerDto[]>(() =>
      allPlayers.map((player) => {
        const team =
          CONST.TEAM.MAP_OPTIONS[player?.team as keyof typeof CONST.TEAM.MAP_OPTIONS] || null;

        // Buscar si este jugador tiene modificaciones
        const modifiedPlayer = playersModified.value.find((p) => p.id === player.id);
        return {
          ...player,
          // Aplicar modificaciones si existen
          ...(modifiedPlayer || {}),
          // Mantener datos del equipo (se sobrescriben después si hay modificaciones)
          team: modifiedPlayer?.team || team?.label || 'Sin equipo',
          teamLogo: modifiedPlayer?.teamLogo || team?.logo || '',
          leagueId: modifiedPlayer?.leagueId ?? team?.leagueId ?? null,
        };
      }),
    );

    const setBudget = (value: number) => {
      budget.value = value;
    };

    /**
     * Modifica o agrega un jugador a la lista de modificaciones
     * @param playerId - ID del jugador a modificar
     * @param modifications - Modificaciones parciales del jugador
     */
    const modifyPlayer = (playerId: string | number, modifications: Partial<PlayerDto>) => {
      const index = playersModified.value.findIndex((p) => p.id === playerId);

      if (index !== -1) {
        // Actualizar jugador existente - Crear nuevo array para asegurar reactividad
        playersModified.value = [
          ...playersModified.value.slice(0, index),
          {
            ...playersModified.value[index],
            ...modifications,
            id: playerId, // Asegurar que el ID siempre esté presente
          } as PlayerDto,
          ...playersModified.value.slice(index + 1),
        ];
      } else {
        // Agregar nueva modificación - Crear nuevo array
        playersModified.value = [
          ...playersModified.value,
          {
            id: playerId,
            ...modifications,
          } as PlayerDto,
        ];
      }
    };

    /**
     * Elimina las modificaciones de un jugador específico
     * @param playerId - ID del jugador
     */
    const removePlayerModification = (playerId: string | number) => {
      // Crear nuevo array sin el jugador - Inmutabilidad para mejor reactividad
      playersModified.value = playersModified.value.filter((p) => p.id !== playerId);
    };

    /**
     * Limpia todas las modificaciones de jugadores
     */
    const clearPlayerModifications = () => {
      playersModified.value = [];
    };

    // ==================== LINEUP PLAYERS MANAGEMENT ====================
    /**
     * Obtiene el estado de un jugador en la alineación
     */
    const getPlayerLineupStatus = (playerId: string | number) => {
      const lineupPlayer = lineupPlayers.value.find((lp) => lp.player.id === playerId);
      return {
        inLineup: !!lineupPlayer,
        isBench: lineupPlayer ? lineupPlayer.isBench : null,
      };
    };

    /**
     * Agrega un jugador a la alineación (campo o banca)
     * @param player - Jugador a agregar
     * @param isBench - Si es true, va a la banca; si es false, va al campo
     * @returns true si se agregó exitosamente, false si no se pudo agregar
     */
    const addLineupPlayer = (player: PlayerDto, isBench = false): boolean => {
      const exists = lineupPlayers.value.some((lp) => lp.player.id === player.id);
      if (exists) {
        return false; // Ya existe en la alineación
      }

      if (isBench) {
        // Validar slots disponibles en la banca
        const maxBenchSlots = CONST.LINEUP.PLAYER_IN_BENCH_SLOTS.length;
        const currentBenchCount = lineupPlayers.value.filter((lp) => lp.isBench).length;

        if (currentBenchCount >= maxBenchSlots) {
          return false; // No hay slots disponibles en la banca
        }
      } else {
        // Validar slots disponibles en el campo
        const formationKey =
          formation.value.value === 'Personalizado' ? ('3-2-1' as const) : formation.value.value;
        const maxFieldSlots = CONST.FORMATION.FORMATION_CONFIGURATION[formationKey].length;
        const currentFieldCount = lineupPlayers.value.filter((lp) => !lp.isBench).length;

        if (currentFieldCount >= maxFieldSlots) {
          return false; // No hay slots disponibles en el campo
        }
      }

      lineupPlayers.value = [...lineupPlayers.value, { player, isBench }];
      return true;
    };

    /**
     * Remueve un jugador de la alineación
     * @param playerId - ID del jugador a remover
     */
    const removeLineupPlayer = (playerId: string | number) => {
      lineupPlayers.value = lineupPlayers.value.filter((lp) => lp.player.id !== playerId);
    };

    /**
     * Mueve un jugador entre campo y banca
     * @param playerId - ID del jugador
     * @param toBench - true para mover a banca, false para mover a campo
     */
    const moveLineupPlayer = (playerId: string | number, toBench: boolean) => {
      const index = lineupPlayers.value.findIndex((lp) => lp.player.id === playerId);
      if (index !== -1) {
        lineupPlayers.value = [
          ...lineupPlayers.value.slice(0, index),
          { ...lineupPlayers.value[index], isBench: toBench },
          ...lineupPlayers.value.slice(index + 1),
        ] as LineupPlayer[];
      }
    };

    /**
     * Actualiza un jugador específico en la alineación
     * @param playerId - ID del jugador
     * @param updates - Actualizaciones parciales del jugador
     */
    const updateLineupPlayer = (playerId: string | number, updates: Partial<PlayerDto>) => {
      const index = lineupPlayers.value.findIndex((lp) => lp.player.id === playerId);
      if (index !== -1) {
        lineupPlayers.value = [
          ...lineupPlayers.value.slice(0, index),
          {
            ...lineupPlayers.value[index],
            player: { ...lineupPlayers.value[index]!.player, ...updates },
          },
          ...lineupPlayers.value.slice(index + 1),
        ] as LineupPlayer[];
      }
    };

    /**
     * Limpia toda la alineación
     */
    const clearLineup = () => {
      lineupPlayers.value = [];
    };

    /**
     * Resetea completamente la alineación incluyendo equipo y entrenador
     */
    const resetLineupSettings = () => {
      // Limpiar jugadores
      clearLineup();
      // Resetear posiciones personalizadas
      resetSlotPositions();
      // Resetear equipo y entrenador
      lineupTeam.value = null;
      lineupCoach.value = null;
      // Resetear nombre de la alineación
      lineupName.value = '';
    };

    /**
     * Sincroniza los jugadores de la alineación con las modificaciones
     * Solo actualiza los jugadores que están en playersModified
     */
    const syncLineupPlayers = () => {
      if (lineupPlayers.value.length === 0 || playersModified.value.length === 0) return;

      lineupPlayers.value = lineupPlayers.value.map((lineupPlayer) => {
        // Buscar si este jugador tiene modificaciones
        const modifiedPlayer = playersModified.value.find((p) => p.id === lineupPlayer.player.id);

        if (modifiedPlayer) {
          // Aplicar modificaciones manteniendo el resto de datos
          return {
            ...lineupPlayer,
            player: {
              ...lineupPlayer.player,
              ...modifiedPlayer,
            },
          };
        }

        // Sin modificaciones, mantener el jugador actual
        return lineupPlayer;
      });
    };

    // Watch para sincronizar automáticamente cuando playersModified cambie
    watch(
      playersModified,
      () => {
        syncLineupPlayers();
      },
      { deep: true },
    );

    watch(
      formation,
      () => {
        resetSlotPositions();
      },
      { deep: true },
    );

    // Computed properties
    const spent = computed(() =>
      lineupPlayers.value.reduce((acc, lp) => {
        if (lp.player.marketValue === null || lp.player.marketValue === undefined) {
          return acc;
        } else {
          return acc + lp.player.marketValue;
        }
      }, 0),
    );

    const remaining = computed(() => budget.value - spent.value);

    const isExceeded = computed(() => remaining.value < 0);

    const percentage = computed(
      () => +(isExceeded.value ? 100 : (spent.value / budget.value) * 100).toFixed(3),
    );

    const fieldPlayers = computed<LineupPlayer[]>(() =>
      lineupPlayers.value.filter((lp) => !lp.isBench),
    );

    const benchPlayers = computed<LineupPlayer[]>(() =>
      lineupPlayers.value.filter((lp) => lp.isBench),
    );

    const fieldPlayersCount = computed(() => fieldPlayers.value.length);

    const benchPlayersCount = computed(() => benchPlayers.value.length);

    const totalPlayersInLineup = computed(() => lineupPlayers.value.length);

    const fieldPlayersInSlots = computed<PlayerSlot[]>(() => {
      const formationKey =
        formation.value.value === 'Personalizado' ? ('3-2-1' as const) : formation.value.value;
      const formationConfiguration = CONST.FORMATION.FORMATION_CONFIGURATION[formationKey];

      // Crear slots vacíos
      const emptySlots = formationConfiguration.map((position) => ({
        playerId: null as number | null,
        name: position.abbreviation,
        id: position.id,
        position: position.abbreviation as PlayerPositionAbbreviation | null,
        x: lineupFieldSlots.value.get(position.id)?.x ?? position.x,
        y: lineupFieldSlots.value.get(position.id)?.y ?? position.y,
        isBench: false,
      }));

      // Trackear asignaciones
      const slotAssignments = new Map<string, LineupPlayer>();
      const assignedPlayerIds = new Set<number | string>();

      // Asignar jugadores: primero por posición coincidente*, luego a slots disponibles
      fieldPlayers.value.forEach((lineupPlayer) => {
        if (assignedPlayerIds.has(lineupPlayer.player.id)) return;

        const matchingSlot = emptySlots.find(
          (slot) =>
            // slot.position === lineupPlayer.player.positionAbbreviation &&
            slot.id === lineupPlayer.slotId && !slotAssignments.has(slot.id),
        );

        if (matchingSlot) {
          slotAssignments.set(matchingSlot.id, lineupPlayer);
          assignedPlayerIds.add(lineupPlayer.player.id);
        }
      });

      // Asignar jugadores restantes a slots disponibles
      fieldPlayers.value.forEach((lineupPlayer) => {
        if (assignedPlayerIds.has(lineupPlayer.player.id)) return;

        const availableSlot = emptySlots.find((slot) => !slotAssignments.has(slot.id));

        if (availableSlot) {
          slotAssignments.set(availableSlot.id, lineupPlayer);
          assignedPlayerIds.add(lineupPlayer.player.id);
        }
      });

      // Construir slots finales con jugadores asignados
      return emptySlots.map((slot): PlayerSlot => {
        const assignedPlayer = slotAssignments.get(slot.id);

        if (assignedPlayer) {
          return {
            playerId: assignedPlayer.player.id,
            name: getDisplayName(assignedPlayer.player.firstName, assignedPlayer.player.lastName),
            id: slot.id,
            position: assignedPlayer.player.positionAbbreviation ?? null,
            x: slot.x,
            y: slot.y,
            isBench: false,
          };
        }

        return {
          playerId: slot.playerId,
          name: slot.name,
          id: slot.id,
          position: slot.position,
          x: slot.x,
          y: slot.y,
          isBench: slot.isBench,
        };
      });
    });

    const benchPlayersInSlots = computed<PlayerSlot[]>(() => {
      return CONST.LINEUP.PLAYER_IN_BENCH_SLOTS.map((benchSlot, index) => {
        const benchPlayer = benchPlayers.value[index];

        return {
          id: benchSlot.id,
          playerId: benchPlayer ? benchPlayer.player.id : null,
          name: benchPlayer
            ? getDisplayName(benchPlayer.player.firstName, benchPlayer.player.lastName)
            : benchSlot.name,
          position: benchPlayer ? benchPlayer.player.positionAbbreviation : benchSlot.position,
          x: null,
          y: null,
          isBench: true,
        } as PlayerSlot;
      });
    });

    const allPlayersInSlots = computed<PlayerSlot[]>(() => {
      return [...fieldPlayersInSlots.value, ...benchPlayersInSlots.value];
    });

    /**
     * Obtiene un jugador de la alineación por su posición
     * @param positionAbbreviation
     * @returns LineupPlayer que coincide con la posición o undefined si no existe
     */
    const getLineupPlayerByPosition = (positionAbbreviation: PlayerPositionAbbreviation) => {
      return lineupPlayers.value.find(
        (lp) => lp.player.positionAbbreviation === positionAbbreviation,
      );
    };

    /**
     * Obtiene un jugador de la alineación por su id
     * @param {number} playerId
     * @returns LineupPlayer que coincide con ID o undefined si no existe
     */
    const getLineupPlayerById = (playerId: number | null): PlayerDto | undefined => {
      if (!playerId) return undefined;

      const lineupPlayer = lineupPlayers.value.find((lp) => lp.player.id === playerId);

      return lineupPlayer?.player || undefined;
    };

    // ==================== SLOT POSITION MANAGEMENT ====================

    /**
     * Actualiza la posición de un slot en el campo
     * @param slotId - ID del slot a mover
     * @param x - Coordenada X normalizada (0-1)
     * @param y - Coordenada Y normalizada (0-1)
     */
    const updateSlotPosition = (slotId: string, x: number, y: number) => {
      const slot = lineupFieldSlots.value.get(slotId);

      if (slot) {
        lineupFieldSlots.value = new Map(lineupFieldSlots.value);
        lineupFieldSlots.value.set(slotId, {
          ...slot,
          x,
          y,
        });
      } else {
        lineupFieldSlots.value.set(slotId, {
          x,
          y,
        });
      }
    };

    /**
     * Resetea las posiciones de todos los slots a la formación actual
     */
    const resetSlotPositions = () => {
      lineupFieldSlots.value.clear();
    };

    /**
     * Mueve un jugador a un slot específico del campo
     * Reordena el array para que el jugador ocupe la posición del slot destino
     * @param playerId - ID del jugador a mover
     * @param targetSlotId - ID del slot de destino
     * @returns true si el movimiento fue exitoso, false en caso contrario
     */
    const movePlayerToSlot = (playerId: number | string, targetSlotId: string): boolean => {
      // Buscar el índice del slot destino en la formación PRIMERO
      const formationKey =
        formation.value.value === 'Personalizado' ? ('3-2-1' as const) : formation.value.value;
      const formationConfiguration = CONST.FORMATION.FORMATION_CONFIGURATION[formationKey];
      const targetSlotIndex = formationConfiguration.findIndex((pos) => pos.id === targetSlotId);

      if (targetSlotIndex === -1) return false;

      // Buscar el jugador en la alineación
      let lineupPlayer = lineupPlayers.value.find((lp) => lp.player.id === playerId);
      if (!lineupPlayer) return false;

      // Si el jugador está en la banca, primero moverlo al campo
      if (lineupPlayer.isBench) {
        moveLineupPlayer(playerId, false);

        // ⚠️ CRÍTICO: Buscar de nuevo el jugador después de moverlo
        // ya que moveLineupPlayer modifica lineupPlayers.value
        lineupPlayer = lineupPlayers.value.find((lp) => lp.player.id === playerId);
        if (!lineupPlayer || lineupPlayer.isBench) return false;
      }
      lineupPlayer.slotId = targetSlotId;
      // Obtener todos los jugadores del campo (sin el jugador actual)
      const fieldPlayersWithoutCurrent = lineupPlayers.value.filter(
        (lp) => !lp.isBench && lp.player.id !== playerId,
      );

      // Obtener todos los jugadores de la banca
      const benchPlayersOnly = lineupPlayers.value.filter((lp) => lp.isBench);

      // Validar que el targetSlotIndex no exceda el número de slots disponibles
      // Si hay menos jugadores que slots, ajustar el índice
      const actualTargetIndex = Math.min(targetSlotIndex, fieldPlayersWithoutCurrent.length);

      // Insertar el jugador en la posición del actualTargetIndex
      const newFieldPlayers = [
        ...fieldPlayersWithoutCurrent.slice(0, actualTargetIndex),
        lineupPlayer,
        ...fieldPlayersWithoutCurrent.slice(actualTargetIndex),
      ];

      // Reconstruir el array completo: jugadores del campo + jugadores de la banca
      lineupPlayers.value = [...newFieldPlayers, ...benchPlayersOnly];

      return true;
    };

    /**
     * Intercambia dos jugadores de posición
     * Funciona para todos los casos:
     * - Campo a campo: ambos jugadores intercambian sus slots en el campo
     * - Banca a banca: ambos jugadores intercambian sus posiciones en la banca
     * - Campo a banca: el jugador de campo va a la banca y viceversa
     * - Con slot vacío: mueve un jugador a un slot vacío
     *
     * @param playerId1 - ID del primer jugador
     * @param playerId2 - ID del segundo jugador (puede ser null para mover a slot vacío)
     * @returns true si el intercambio fue exitoso, false en caso contrario
     */
    const swapPlayers = (
      playerId1: number | string,
      playerId2: number | string | null,
    ): boolean => {
      // Buscar el jugador 1
      const lineupPlayer1 = lineupPlayers.value.find((lp) => lp.player.id === playerId1);
      if (!lineupPlayer1) return false;

      const index1 = lineupPlayers.value.indexOf(lineupPlayer1);
      if (index1 === -1) return false;

      // Caso 1: Intercambio con slot vacío (playerId2 es null)
      if (playerId2 === null) {
        // En este caso, solo necesitamos asegurarnos de que el jugador esté en su posición
        // No hay intercambio real, ya que no hay otro jugador
        // Esto podría usarse para mover a un slot vacío específico en el futuro
        return true;
      }

      // Caso 2: Intercambio entre dos jugadores
      const lineupPlayer2 = lineupPlayers.value.find((lp) => lp.player.id === playerId2);
      if (!lineupPlayer2) return false;

      const index2 = lineupPlayers.value.indexOf(lineupPlayer2);
      if (index2 === -1) return false;

      // Crear nuevo array para mantener inmutabilidad
      const newLineupPlayers = [...lineupPlayers.value];

      // Obtener el estado isBench de cada jugador
      const player1IsBench = lineupPlayer1.isBench;
      const player2IsBench = lineupPlayer2.isBench;

      // IMPORTANTE: Para que el intercambio funcione correctamente,
      // necesitamos intercambiar tanto el estado isBench como la posición en el array

      // Intercambiar completamente los jugadores en sus posiciones
      // Esto asegura que:
      // - Campo ↔ Campo: Los jugadores intercambian sus índices en el array (slots)
      // - Banca ↔ Banca: Los jugadores intercambian sus índices en el array (posiciones en banca)
      // - Campo ↔ Banca: Los jugadores intercambian tanto posición como estado isBench
      newLineupPlayers[index1] = {
        ...lineupPlayer2,
        slotId: lineupPlayer1.slotId || null,
        isBench: player1IsBench,
      };
      newLineupPlayers[index2] = {
        ...lineupPlayer1,
        slotId: lineupPlayer2.slotId || null,
        isBench: player2IsBench,
      };

      lineupPlayers.value = newLineupPlayers;
      return true;
    };

    return {
      // State
      lineupName,
      lineupTeam,
      lineupCoach,
      showTeamInLineup,
      showCoachInLineup,
      budget,
      currency,
      formation,
      playersModified,
      lineupPlayers,
      lineupFieldSlots,
      lineupBenchSlots,

      // Filters
      filters,
      orderBy,

      // Calculated - Budget
      players,
      spent,
      remaining,
      percentage,
      isExceeded,

      // Calculated - Lineup
      fieldPlayers,
      benchPlayers,
      fieldPlayersCount,
      benchPlayersCount,
      totalPlayersInLineup,
      fieldPlayersInSlots,
      benchPlayersInSlots,
      allPlayersInSlots,

      // Methods - Player Modifications
      setBudget,
      modifyPlayer,
      removePlayerModification,
      clearPlayerModifications,

      // Methods - Lineup Management
      addLineupPlayer,
      removeLineupPlayer,
      moveLineupPlayer,
      updateLineupPlayer,
      clearLineup,
      resetLineupSettings,
      syncLineupPlayers,
      getPlayerLineupStatus,
      getLineupPlayerByPosition,
      getLineupPlayerById,

      // Methods - Slot Position Management
      updateSlotPosition,
      resetSlotPositions,
      swapPlayers,
      movePlayerToSlot,
    };
  },
  {
    persistedState: {
      persist: true,
      // Solo persistir configuración relevante, modificaciones y alineación
      includePaths: [
        'lineupName',
        'lineupTeam',
        'lineupCoach',
        'showTeamInLineup',
        'showCoachInLineup',
        'budget',
        'currency',
        'formation',
        'playersModified',
        'lineupPlayers', // Persistir la alineación completa
        'lineupFieldSlots',
        'lineupBenchSlots',
        'filters',
        'orderBy',
      ],
      // Serializer: Convertir Map a Array antes de guardar en IndexedDB
      serialize: (state) => {
        const serialized = { ...state };
        // Convertir Map a Array de entries [[key, value], ...]
        // @ts-expect-error should be an array
        serialized.lineupFieldSlots = Array.from(state.lineupFieldSlots.entries());
        return serialized;
      },
      // Deserializer: Convertir Array de vuelta a Map al rehidratar
      deserialize: (value) => {
        const state = { ...value };
        // Convertir Array de entries de vuelta a Map
        if (Array.isArray(state.lineupFieldSlots)) {
          state.lineupFieldSlots = new Map(state.lineupFieldSlots);
        }
        return state;
      },
    },
  },
);

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useLineupStore, import.meta.hot));
}
