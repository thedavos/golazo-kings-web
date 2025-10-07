import { computed, ref } from 'vue';
import { acceptHMRUpdate, defineStore } from 'pinia';
import { SavedLineupEntity } from 'src/modules/saved-lineups/domain/entities/saved-lineup.entity';
import { SavedLineupMapper } from 'src/modules/saved-lineups/mappers/saved-lineup.mapper';
import { CONST } from 'src/modules/saved-lineups/constants';
import { useLineupStore } from './useLineupStore';
import type {
  SavedLineupDto,
  SavedLineupSummaryDto,
  CreateSavedLineupDto,
} from 'src/modules/saved-lineups/dtos/saved-lineup.dto';
import type { SavedLineupsStateType } from 'src/modules/saved-lineups/constants/savedLineupsState.constant';

export const useSavedLineupsStore = defineStore(
  'saved-lineups',
  () => {
    // ==================== STATE ====================
    const savedLineups = ref<SavedLineupDto[]>([]);
    const saveState = ref<SavedLineupsStateType>(CONST.SAVED_LINEUPS_STATE.IDLE);
    const lastErrorMessage = ref<string | null>(null);

    // ==================== COMPUTED ====================

    /**
     * Verifica si hay una operación en curso
     */
    const isLoading = computed(() => saveState.value === CONST.SAVED_LINEUPS_STATE.LOADING);

    /**
     * Verifica si hubo un error
     */
    const hasError = computed(() => saveState.value === CONST.SAVED_LINEUPS_STATE.ERROR);

    /**
     * Verifica si la última operación fue exitosa
     */
    const isSuccess = computed(() => saveState.value === CONST.SAVED_LINEUPS_STATE.SUCCESS);

    /**
     * Obtiene resúmenes de todas las alineaciones para listados
     */
    const lineupSummaries = computed((): SavedLineupSummaryDto[] => {
      return savedLineups.value.map((dto) => {
        const entity = SavedLineupMapper.dtoToEntity(dto);
        return SavedLineupMapper.entityToSummaryDto(entity);
      });
    });

    /**
     * Obtiene alineaciones ordenadas por fecha de actualización (más recientes primero)
     */
    const lineupsSortedByDate = computed((): SavedLineupSummaryDto[] => {
      return [...lineupSummaries.value].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    });

    /**
     * Número total de alineaciones guardadas
     */
    const totalLineups = computed((): number => savedLineups.value.length);

    /**
     * Verifica si hay alineaciones guardadas
     */
    const hasLineups = computed((): boolean => totalLineups.value > 0);

    /**
     * Obtiene alineaciones completas (con al menos 11 jugadores en campo)
     */
    const completeLineups = computed((): SavedLineupSummaryDto[] => {
      return lineupSummaries.value.filter((lineup) => lineup.isComplete);
    });

    // ==================== HELPERS PRIVADOS ====================

    /**
     * Busca una alineación por ID y lanza error si no existe
     */
    const findLineupOrThrow = (lineupId: string): SavedLineupDto => {
      const dto = savedLineups.value.find((lineup) => lineup.id === lineupId);

      if (!dto) {
        const errorMessage = `Alineación con ID ${lineupId} no encontrada`;
        saveState.value = CONST.SAVED_LINEUPS_STATE.ERROR;
        lastErrorMessage.value = errorMessage;
        throw new Error(errorMessage);
      }

      return dto;
    };

    // ==================== ACTIONS ====================

    /**
     * Guarda la alineación actual del useLineupStore
     */
    const saveCurrentLineup = (): SavedLineupEntity => {
      const lineupStore = useLineupStore();

      if (!lineupStore.lineupName.trim()) {
        saveState.value = CONST.SAVED_LINEUPS_STATE.ERROR;
        lastErrorMessage.value = 'El nombre de la alineación es requerido';
        throw new Error('El nombre de la alineación es requerido');
      }

      saveState.value = CONST.SAVED_LINEUPS_STATE.LOADING;
      lastErrorMessage.value = null;

      try {
        // Crear DTO desde el estado actual
        const createDto: CreateSavedLineupDto = {
          name: lineupStore.lineupName,
          formation: lineupStore.formation,
          team: lineupStore.lineupTeam,
          coach: lineupStore.lineupCoach,
          budget: lineupStore.budget,
          currency: lineupStore.currency,
          players: lineupStore.lineupPlayers,
          fieldSlots: lineupStore.lineupFieldSlots,
          showTeamInLineup: lineupStore.showTeamInLineup,
          showCoachInLineup: lineupStore.showCoachInLineup,
          playersModified: lineupStore.playersModified,
        };

        // Crear entidad
        const entity = SavedLineupMapper.createDtoToEntity(createDto);

        // Verificar si ya existe una alineación con el mismo nombre
        const existingIndex = savedLineups.value.findIndex(
          (lineup) => lineup.name.toLowerCase() === entity.name.toLowerCase(),
        );

        if (existingIndex >= 0) {
          // Actualizar existente
          const updatedEntity = entity.update({
            id: savedLineups.value[existingIndex]!.id,
          });
          const updatedDto = SavedLineupMapper.entityToDto(updatedEntity);

          savedLineups.value = [
            ...savedLineups.value.slice(0, existingIndex),
            updatedDto,
            ...savedLineups.value.slice(existingIndex + 1),
          ];
        } else {
          // Agregar nueva
          const dto = SavedLineupMapper.entityToDto(entity);
          savedLineups.value = [...savedLineups.value, dto];
        }

        saveState.value = CONST.SAVED_LINEUPS_STATE.SUCCESS;
        return entity;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Error desconocido al guardar';
        saveState.value = CONST.SAVED_LINEUPS_STATE.ERROR;
        lastErrorMessage.value = errorMessage;
        throw error instanceof Error ? error : new Error(String(error));
      }
    };

    /**
     * Carga una alineación por ID y la restaura en useLineupStore
     */
    const loadLineup = (lineupId: string): void => {
      try {
        const dto = findLineupOrThrow(lineupId);

        saveState.value = CONST.SAVED_LINEUPS_STATE.LOADING;
        lastErrorMessage.value = null;

        const entity = SavedLineupMapper.dtoToEntity(dto);
        const lineupStore = useLineupStore();

        // Restaurar estado en useLineupStore
        lineupStore.lineupName = entity.name;
        lineupStore.lineupTeam = entity.team;
        lineupStore.lineupCoach = entity.coach;
        lineupStore.formation = entity.formation;
        lineupStore.budget = entity.budget;
        lineupStore.currency = entity.currency;
        lineupStore.showTeamInLineup = entity.showTeamInLineup;
        lineupStore.showCoachInLineup = entity.showCoachInLineup;

        // Restaurar jugadores modificados
        lineupStore.playersModified = [...entity.playersModified];

        // Restaurar alineación
        lineupStore.lineupPlayers = [...entity.players];

        // Restaurar posiciones de campo
        lineupStore.lineupFieldSlots = new Map(entity.fieldSlots);

        saveState.value = CONST.SAVED_LINEUPS_STATE.SUCCESS;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar';
        saveState.value = CONST.SAVED_LINEUPS_STATE.ERROR;
        lastErrorMessage.value = errorMessage;
        throw error instanceof Error ? error : new Error(String(error));
      }
    };

    /**
     * Elimina una alineación por ID
     */
    const deleteLineup = (lineupId: string): void => {
      const index = savedLineups.value.findIndex((lineup) => lineup.id === lineupId);

      if (index === -1) {
        saveState.value = CONST.SAVED_LINEUPS_STATE.ERROR;
        lastErrorMessage.value = `Alineación con ID ${lineupId} no encontrada`;
        throw new Error(`Alineación con ID ${lineupId} no encontrada`);
      }

      saveState.value = CONST.SAVED_LINEUPS_STATE.LOADING;
      lastErrorMessage.value = null;

      try {
        savedLineups.value = [
          ...savedLineups.value.slice(0, index),
          ...savedLineups.value.slice(index + 1),
        ];
        saveState.value = CONST.SAVED_LINEUPS_STATE.SUCCESS;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Error desconocido al eliminar';
        saveState.value = CONST.SAVED_LINEUPS_STATE.ERROR;
        lastErrorMessage.value = errorMessage;
        throw error instanceof Error ? error : new Error(String(error));
      }
    };

    /**
     * Obtiene una alineación por ID
     */
    const getLineupById = (lineupId: string): SavedLineupSummaryDto | undefined => {
      return lineupSummaries.value.find((lineup) => lineup.id === lineupId);
    };

    /**
     * Busca alineaciones por nombre
     */
    const searchLineups = (searchTerm: string): SavedLineupSummaryDto[] => {
      if (!searchTerm.trim()) {
        return lineupsSortedByDate.value;
      }

      const searchLower = searchTerm.toLowerCase();
      return lineupSummaries.value.filter(
        (lineup) =>
          lineup.name.toLowerCase().includes(searchLower) ||
          lineup.formation.toLowerCase().includes(searchLower) ||
          lineup.teamName?.toLowerCase().includes(searchLower),
      );
    };

    /**
     * Duplica una alineación existente
     */
    const duplicateLineup = (lineupId: string): SavedLineupEntity => {
      try {
        const dto = findLineupOrThrow(lineupId);

        saveState.value = CONST.SAVED_LINEUPS_STATE.LOADING;
        lastErrorMessage.value = null;

        const originalEntity = SavedLineupMapper.dtoToEntity(dto);

        // Crear copia con nuevo nombre
        const duplicateEntity = new SavedLineupEntity({
          name: `${originalEntity.name} (Copia)`,
          formation: originalEntity.formation,
          team: originalEntity.team,
          coach: originalEntity.coach,
          budget: originalEntity.budget,
          currency: originalEntity.currency,
          players: [...originalEntity.players],
          fieldSlots: new Map(originalEntity.fieldSlots),
          showTeamInLineup: originalEntity.showTeamInLineup,
          showCoachInLineup: originalEntity.showCoachInLineup,
          playersModified: [...originalEntity.playersModified],
        });

        const duplicateDto = SavedLineupMapper.entityToDto(duplicateEntity);
        savedLineups.value = [...savedLineups.value, duplicateDto];

        saveState.value = CONST.SAVED_LINEUPS_STATE.SUCCESS;
        return duplicateEntity;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Error desconocido al duplicar';
        saveState.value = CONST.SAVED_LINEUPS_STATE.ERROR;
        lastErrorMessage.value = errorMessage;
        throw error instanceof Error ? error : new Error(String(error));
      }
    };
    /**
     * Limpia todas las alineaciones (útil para testing)
     */
    const clearAllLineups = (): void => {
      savedLineups.value = [];
      saveState.value = CONST.SAVED_LINEUPS_STATE.IDLE;
      lastErrorMessage.value = null;
    };

    /**
     * Limpia el error y resetea el estado a idle
     */
    const clearError = (): void => {
      saveState.value = CONST.SAVED_LINEUPS_STATE.IDLE;
      lastErrorMessage.value = null;
    };

    return {
      // State
      savedLineups,
      saveState,
      lastErrorMessage,

      // Computed
      isLoading,
      hasError,
      isSuccess,
      lineupSummaries,
      lineupsSortedByDate,
      totalLineups,
      hasLineups,
      completeLineups,

      // Actions
      saveCurrentLineup,
      loadLineup,
      deleteLineup,
      getLineupById,
      searchLineups,
      duplicateLineup,
      clearAllLineups,
      clearError,
    };
  },
  {
    persistedState: {
      persist: true,
      // Persistir todo el estado usando localforage (IndexedDB)
      includePaths: [
        'savedLineups', // Array de alineaciones guardadas
      ],
      // No necesitamos serializer/deserializer personalizados
      // porque los DTOs ya manejan la serialización correctamente
    },
  },
);

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSavedLineupsStore, import.meta.hot));
}
