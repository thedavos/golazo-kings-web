import { useQuasar } from 'quasar';

/**
 * Composable para gestión de dialogs de alineaciones guardadas
 * Sigue el patrón de dialogs establecido en el proyecto
 * @see docs/WARP.md - Dialog Management
 */
export function useSavedLineupsDialogs() {
  const $q = useQuasar();

  /**
   * Abre dialog de confirmación para eliminar alineación
   */
  const openDeleteConfirmDialog = (lineupName: string) => {
    return $q.dialog({
      title: 'Eliminar Alineación',
      message: `¿Estás seguro de que quieres eliminar "${lineupName}"? Esta acción no se puede deshacer.`,
      cancel: {
        label: 'Cancelar',
        flat: true,
        noCaps: true,
        color: 'grey-7',
      },
      ok: {
        label: 'Eliminar',
        color: 'negative',
        unelevated: true,
        noCaps: true,
      },
      persistent: false,
    });
  };

  /**
   * Abre dialog de confirmación para limpiar todas las alineaciones
   */
  const openClearAllConfirmDialog = () => {
    return $q.dialog({
      title: 'Eliminar Todas las Alineaciones',
      message: '¿Estás seguro de que quieres eliminar todas tus alineaciones guardadas? Esta acción no se puede deshacer.',
      cancel: {
        label: 'Cancelar',
        flat: true,
        noCaps: true,
        color: 'grey-7',
      },
      ok: {
        label: 'Eliminar Todas',
        color: 'negative',
        unelevated: true,
        noCaps: true,
      },
      persistent: false,
    });
  };

  return {
    openDeleteConfirmDialog,
    openClearAllConfirmDialog,
  };
}