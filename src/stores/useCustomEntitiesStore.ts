import { ref, computed } from 'vue';
import { acceptHMRUpdate, defineStore } from 'pinia';
import type {
  CustomPlayer,
  CustomTeam,
  CustomCoach,
} from 'src/modules/lineup-builder/types/custom-entities.types';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';

/**
 * Genera un ID numérico único para entidades personalizadas
 * Usa timestamp + contador para garantizar unicidad
 */
let customEntityIdCounter = 0;
const generateCustomEntityId = (): number => {
  // Empezar desde un número grande para evitar colisiones con IDs reales
  // 9000000000 + timestamp truncado + contador
  const baseId = 9000000000;
  const timestamp = Date.now() % 1000000; // Últimos 6 dígitos del timestamp
  customEntityIdCounter = (customEntityIdCounter + 1) % 1000;
  return baseId + timestamp * 1000 + customEntityIdCounter;
};

export const useCustomEntitiesStore = defineStore(
  'customEntities',
  () => {
    // ==================== STATE ====================
    const customPlayers = ref<CustomPlayer[]>([]);
    const customTeams = ref<CustomTeam[]>([]);
    const customCoaches = ref<CustomCoach[]>([]);

    // ==================== COMPUTED ====================

    /**
     * Total de jugadores personalizados
     */
    const customPlayersCount = computed(() => customPlayers.value.length);

    /**
     * Total de equipos personalizados
     */
    const customTeamsCount = computed(() => customTeams.value.length);

    /**
     * Total de entrenadores personalizados
     */
    const customCoachesCount = computed(() => customCoaches.value.length);

    /**
     * Obtiene un jugador personalizado por ID
     */
    const getCustomPlayerById = computed(() => {
      return (playerId: number) => customPlayers.value.find((p) => p.id === playerId);
    });

    /**
     * Obtiene un equipo personalizado por value
     */
    const getCustomTeamByValue = computed(() => {
      return (teamValue: string) => customTeams.value.find((t) => t.value === teamValue);
    });

    /**
     * Obtiene un entrenador personalizado por value
     */
    const getCustomCoachByValue = computed(() => {
      return (coachValue: string) => customCoaches.value.find((c) => c.value === coachValue);
    });

    // ==================== CUSTOM PLAYERS ====================

    /**
     * Agrega un jugador personalizado
     * @param player - Datos del jugador personalizado (sin ID)
     * @returns El jugador creado con su ID generado
     */
    const addCustomPlayer = (player: Omit<CustomPlayer, 'id' | 'isCustomEntity'>): CustomPlayer => {
      const newPlayer: CustomPlayer = {
        ...player,
        id: generateCustomEntityId(),
        isCustomEntity: true,
      };

      customPlayers.value = [...customPlayers.value, newPlayer];
      return newPlayer;
    };

    /**
     * Actualiza un jugador personalizado
     * @param playerId - ID del jugador
     * @param updates - Actualizaciones parciales
     * @returns true si se actualizó exitosamente, false si no se encontró
     */
    const updateCustomPlayer = (playerId: number, updates: Partial<CustomPlayer>): boolean => {
      const index = customPlayers.value.findIndex((p) => p.id === playerId);
      if (index === -1) return false;

      customPlayers.value = [
        ...customPlayers.value.slice(0, index),
        {
          ...customPlayers.value[index],
          ...updates,
          id: playerId, // Mantener el ID original
          isCustomEntity: true, // Mantener el flag
        },
        ...customPlayers.value.slice(index + 1),
      ] as PlayerDto[];

      return true;
    };

    /**
     * Elimina un jugador personalizado
     * @param playerId - ID del jugador
     * @returns true si se eliminó exitosamente, false si no se encontró
     */
    const deleteCustomPlayer = (playerId: number): boolean => {
      const length = customPlayers.value.length;
      customPlayers.value = customPlayers.value.filter((p) => p.id !== playerId);
      return customPlayers.value.length < length;
    };

    /**
     * Verifica si un jugador es personalizado
     * @param playerId - ID del jugador
     * @returns true si es personalizado, false si no
     */
    const isCustomPlayer = (playerId: number): boolean => {
      return customPlayers.value.some((p) => p.id === playerId);
    };

    // ==================== CUSTOM TEAMS ====================

    /**
     * Agrega un equipo personalizado
     * @param team - Datos del equipo personalizado
     * @returns El equipo creado
     */
    const addCustomTeam = (team: Omit<CustomTeam, 'isCustomEntity'>): CustomTeam => {
      const newTeam: CustomTeam = {
        ...team,
        isCustomEntity: true,
      };
      customTeams.value = [...customTeams.value, newTeam];
      return newTeam;
    };

    /**
     * Actualiza un equipo personalizado
     * @param teamValue - Value del equipo
     * @param updates - Actualizaciones parciales
     * @returns true si se actualizó exitosamente, false si no se encontró
     */
    const updateCustomTeam = (teamValue: string, updates: Partial<CustomTeam>): boolean => {
      const index = customTeams.value.findIndex((t) => t.value === teamValue);
      if (index === -1) return false;

      const existingTeam = customTeams.value[index] as CustomTeam;
      const updatedTeam: CustomTeam = {
        ...existingTeam,
        ...updates,
        // Asegurar campos requeridos
        logo: updates.logo ?? existingTeam.logo,
        leagueId: updates.leagueId ?? existingTeam.leagueId,
        label: updates.label ?? existingTeam.label,
        value: updates.value ?? existingTeam.value,
        isCustomEntity: true,
      };

      customTeams.value = [
        ...customTeams.value.slice(0, index),
        updatedTeam,
        ...customTeams.value.slice(index + 1),
      ];

      return true;
    };

    /**
     * Elimina un equipo personalizado
     * @param teamValue - Value del equipo
     * @returns true si se eliminó exitosamente, false si no se encontró
     */
    const deleteCustomTeam = (teamValue: string): boolean => {
      const length = customTeams.value.length;
      customTeams.value = customTeams.value.filter((t) => t.value !== teamValue);
      return customTeams.value.length < length;
    };

    /**
     * Verifica si un equipo es personalizado
     * @param teamValue - Value del equipo
     * @returns true si es personalizado, false si no
     */
    const isCustomTeam = (teamValue: string): boolean => {
      return customTeams.value.some((t) => t.value === teamValue);
    };

    // ==================== CUSTOM COACHES ====================

    /**
     * Agrega un entrenador personalizado
     * @param coach - Datos del entrenador personalizado
     * @returns El entrenador creado
     */
    const addCustomCoach = (coach: Omit<CustomCoach, 'isCustomEntity'>): CustomCoach => {
      const newCoach: CustomCoach = {
        ...coach,
        isCustomEntity: true,
      };
      customCoaches.value = [...customCoaches.value, newCoach];
      return newCoach;
    };

    /**
     * Actualiza un entrenador personalizado
     * @param coachValue - Value del entrenador
     * @param updates - Actualizaciones parciales
     * @returns true si se actualizó exitosamente, false si no se encontró
     */
    const updateCustomCoach = (coachValue: string, updates: Partial<CustomCoach>): boolean => {
      const index = customCoaches.value.findIndex((c) => c.value === coachValue);
      if (index === -1) return false;

      const existingCoach = customCoaches.value[index] as CustomCoach;
      const updatedCoach: CustomCoach = {
        ...existingCoach,
        ...updates,
        // Asegurar campos requeridos
        photoUrl: updates.photoUrl ?? existingCoach.photoUrl,
        label: updates.label ?? existingCoach.label,
        value: updates.value ?? existingCoach.value,
        isCustomEntity: true,
      };

      customCoaches.value = [
        ...customCoaches.value.slice(0, index),
        updatedCoach,
        ...customCoaches.value.slice(index + 1),
      ];

      return true;
    };

    /**
     * Elimina un entrenador personalizado
     * @param coachValue - Value del entrenador
     * @returns true si se eliminó exitosamente, false si no se encontró
     */
    const deleteCustomCoach = (coachValue: string): boolean => {
      const length = customCoaches.value.length;
      customCoaches.value = customCoaches.value.filter((c) => c.value !== coachValue);
      return customCoaches.value.length < length;
    };

    /**
     * Verifica si un entrenador es personalizado
     * @param coachValue - Value del entrenador
     * @returns true si es personalizado, false si no
     */
    const isCustomCoach = (coachValue: string): boolean => {
      return customCoaches.value.some((c) => c.value === coachValue);
    };

    // ==================== BULK OPERATIONS ====================

    /**
     * Limpia todos los jugadores personalizados
     */
    const clearCustomPlayers = () => {
      customPlayers.value = [];
    };

    /**
     * Limpia todos los equipos personalizados
     */
    const clearCustomTeams = () => {
      customTeams.value = [];
    };

    /**
     * Limpia todos los entrenadores personalizados
     */
    const clearCustomCoaches = () => {
      customCoaches.value = [];
    };

    /**
     * Limpia todas las entidades personalizadas
     */
    const clearAll = () => {
      clearCustomPlayers();
      clearCustomTeams();
      clearCustomCoaches();
    };

    return {
      // State
      customPlayers,
      customTeams,
      customCoaches,

      // Computed
      customPlayersCount,
      customTeamsCount,
      customCoachesCount,
      getCustomPlayerById,
      getCustomTeamByValue,
      getCustomCoachByValue,

      // Methods - Players
      addCustomPlayer,
      updateCustomPlayer,
      deleteCustomPlayer,
      isCustomPlayer,

      // Methods - Teams
      addCustomTeam,
      updateCustomTeam,
      deleteCustomTeam,
      isCustomTeam,

      // Methods - Coaches
      addCustomCoach,
      updateCustomCoach,
      deleteCustomCoach,
      isCustomCoach,

      // Methods - Bulk
      clearCustomPlayers,
      clearCustomTeams,
      clearCustomCoaches,
      clearAll,
    };
  },
  {
    persistedState: {
      persist: true,
      includePaths: ['customPlayers', 'customTeams', 'customCoaches'],
    },
  },
);

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCustomEntitiesStore, import.meta.hot));
}
