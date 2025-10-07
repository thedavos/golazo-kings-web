import { useFeedback } from 'src/modules/shared/composables';

/**
 * Composable para feedback de operaciones con alineaciones guardadas
 * Sigue el patrón de feedback establecido en el proyecto
 * @see docs/WARP.md - User Notifications Pattern
 */
export function useSavedLineupsFeedback() {
  const feedback = useFeedback();

  /**
   * Feedback para cuando se carga exitosamente una alineación
   */
  const lineupLoaded = (lineupName: string) => {
    feedback.success({
      message: `Alineación "${lineupName}" cargada correctamente`,
      icon: 'la la-folder-open',
      timeout: 2000,
    });
  };

  /**
   * Feedback para cuando falla la carga de una alineación
   */
  const lineupLoadError = () => {
    feedback.error({
      message: 'No se pudo cargar la alineación',
      caption: 'Verifica que la alineación existe e intenta nuevamente',
      icon: 'la la-exclamation-circle',
      timeout: 3000,
    });
  };

  /**
   * Feedback para cuando se elimina exitosamente una alineación
   */
  const lineupDeleted = (lineupName?: string) => {
    const message = lineupName
      ? `Alineación "${lineupName}" eliminada correctamente`
      : 'Alineación eliminada correctamente';

    feedback.success({
      message,
      icon: 'la la-trash-alt',
      timeout: 2000,
    });
  };

  /**
   * Feedback para cuando falla la eliminación de una alineación
   */
  const lineupDeleteError = () => {
    feedback.error({
      message: 'No se pudo eliminar la alineación',
      caption: 'Intenta nuevamente',
      icon: 'la la-exclamation-circle',
      timeout: 3000,
    });
  };

  /**
   * Feedback para cuando se duplica exitosamente una alineación
   */
  const lineupDuplicated = (lineupName?: string) => {
    const message = lineupName
      ? `Alineación "${lineupName}" duplicada correctamente`
      : 'Alineación duplicada correctamente';

    feedback.success({
      message,
      icon: 'la la-copy',
      timeout: 2000,
    });
  };

  /**
   * Feedback para cuando falla la duplicación de una alineación
   */
  const lineupDuplicateError = () => {
    feedback.error({
      message: 'No se pudo duplicar la alineación',
      caption: 'Intenta nuevamente',
      icon: 'la la-exclamation-circle',
      timeout: 3000,
    });
  };

  /**
   * Feedback para cuando no se encuentran alineaciones en la búsqueda
   */
  const noLineupsFound = () => {
    feedback.info({
      message: 'No se encontraron alineaciones',
      caption: 'Prueba con otros términos de búsqueda',
      icon: 'la la-search',
      timeout: 2500,
    });
  };

  return {
    lineupLoaded,
    lineupLoadError,
    lineupDeleted,
    lineupDeleteError,
    lineupDuplicated,
    lineupDuplicateError,
    noLineupsFound,
  };
}