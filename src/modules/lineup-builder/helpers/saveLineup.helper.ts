import type { useLineupStore } from 'stores/useLineupStore';
import type { useSavedLineupsStore } from 'stores/useSavedLineupsStore';
import type { useLineupFeedback } from 'src/modules/lineup-builder/composables/useLineupFeedback';

interface SaveLineupParams {
  lineupStore: ReturnType<typeof useLineupStore>;
  savedLineupsStore: ReturnType<typeof useSavedLineupsStore>;
  lineupFeedback: ReturnType<typeof useLineupFeedback>;
}

/**
 * Maneja el guardado de la alineación actual
 * Sigue el patrón de helpers establecido en el proyecto
 * @see docs/LINEUP_HELPERS_REFACTOR.md
 */
export const handleSaveLineup = (params: SaveLineupParams): void => {
  const { lineupStore, savedLineupsStore, lineupFeedback } = params;

  // Verificar que tiene nombre
  if (!lineupStore.lineupName.trim()) {
    lineupFeedback.error('Por favor ingresa un nombre para la alineación');
    return;
  }

  try {
    // Guardar la alineación
    savedLineupsStore.saveCurrentLineup();

    // Feedback exitoso
    lineupFeedback.saveSuccess(lineupStore.lineupName);
  } catch (error) {
    // Feedback de error
    const errorMessage = error instanceof Error ? error.message : undefined;
    lineupFeedback.saveError(errorMessage);
    console.error('Error al guardar alineación:', error);
  }
};
