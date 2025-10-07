import { useRouter } from 'vue-router';
import { useFeedback } from 'src/modules/shared/composables';

export function useLineupFeedback() {
  const feedback = useFeedback();
  const router = useRouter();

  /**
   * Feedback para cuando se guarda exitosamente una alineación
   */
  const saveSuccess = (lineupName?: string) => {
    const message = lineupName
      ? `Se ha guardado tu alineación "${lineupName}".`
      : 'Alineación guardada correctamente';

    feedback.success({
      message,
      icon: 'la la-check-circle',
      timeout: 2500,
      position: 'bottom-right',
      actions: [
        {
          label: 'Cerrar',
          color: 'white',
          flat: true,
          noCaps: true,
          size: '12px',
          handler: () => {},
        },
        {
          label: 'Ver todas mis alineaciones',
          color: 'white',
          flat: true,
          noCaps: true,
          size: '12px',
          handler: () => {
            void router.push({ name: 'lineups' });
          },
        },
      ],
    });
  };

  /**
   * Feedback para cuando falla el guardado de una alineación
   */
  const saveError = (errorMessage?: string) => {
    feedback.error({
      message: 'No se pudo guardar la alineación',
      caption: errorMessage || 'Intenta nuevamente',
      icon: 'la la-exclamation-circle',
      timeout: 3500,
    });
  };

  /**
   * Feedback para cuando se está guardando una alineación
   */
  const savingLineup = () => {
    feedback.loading({
      message: 'Guardando alineación...',
      icon: 'la la-spinner la-spin',
      timeout: 0, // No se cierra automáticamente
    });
  };

  /**
   * Feedback para cuando se agrega un jugador exitosamente
   */
  const playerAdded = (playerName?: string) => {
    const message = playerName
      ? `${playerName} agregado a la alineación`
      : 'Jugador agregado a la alineación';

    feedback.success({
      message,
      icon: 'la la-user-plus',
      timeout: 2000,
    });
  };

  /**
   * Feedback para cuando se agrega un jugador al campo
   */
  const playerAddedToField = (playerName: string) => {
    feedback.success({
      message: `${playerName} añadido al campo`,
      icon: 'la la-users',
      timeout: 2000,
    });
  };

  /**
   * Feedback para cuando se agrega un jugador a la banca
   */
  const playerAddedToBench = (playerName: string) => {
    feedback.info({
      message: `${playerName} añadido a la banca`,
      icon: 'la la-chair',
      timeout: 2000,
    });
  };

  /**
   * Feedback para cuando se mueve un jugador
   */
  const playerMoved = (playerName: string, toBench: boolean) => {
    feedback.info({
      message: `${playerName} movido a ${toBench ? 'la banca' : 'el campo'}`,
      icon: toBench ? 'la la-chair' : 'la la-users',
      timeout: 2000,
    });
  };

  /**
   * Feedback para cuando se intercambian dos jugadores
   */
  const playersSwapped = (player1Name: string, player2Name: string) => {
    feedback.success({
      message: `Intercambio exitoso: ${player1Name} ↔ ${player2Name}`,
      icon: 'la la-exchange-alt',
      timeout: 2500,
    });
  };

  /**
   * Feedback para cuando falla el intercambio de jugadores
   */
  const swapError = () => {
    feedback.error({
      message: 'No se pudo realizar el intercambio',
      caption: 'Verifica que ambos jugadores estén en la alineación',
      icon: 'la la-exclamation-circle',
      timeout: 3000,
    });
  };

  /**
   * Feedback para cuando se elimina un jugador
   */
  const playerRemoved = (playerName?: string) => {
    const message = playerName
      ? `${playerName} eliminado de la alineación`
      : 'Jugador eliminado de la alineación';

    feedback.info({
      message,
      icon: 'la la-user-minus',
      timeout: 2000,
    });
  };

  /**
   * Feedback para cuando se actualiza un jugador exitosamente
   */
  const playerUpdated = (playerName?: string) => {
    const message = playerName
      ? `${playerName} actualizado correctamente`
      : 'Jugador actualizado correctamente';

    feedback.success({
      message,
      icon: 'la la-check',
      timeout: 2000,
    });
  };

  /**
   * Feedback para cuando falla la actualización de un jugador
   */
  const playerUpdateError = () => {
    feedback.error({
      message: 'No se pudo actualizar el jugador',
      caption: 'Verifica los datos e intenta nuevamente',
      timeout: 3000,
    });
  };

  /**
   * Feedback para cuando no hay presupuesto suficiente
   */
  const insufficientBudget = () => {
    feedback.warning({
      message: 'Presupuesto insuficiente',
      caption: 'No puedes agregar este jugador. Ajusta o descarta a algún otro jugador',
      icon: 'la la-money-bill-wave',
      timeout: 4000,
    });
  };

  /**
   * Feedback para cuando la posición del jugador no coincide
   */
  const wrongPosition = () => {
    feedback.warning({
      message: 'Posición incorrecta',
      caption: 'Este jugador no puede ocupar esta posición',
      icon: 'la la-exclamation-triangle',
      timeout: 3000,
    });
  };

  /**
   * Feedback para cuando el jugador ya está en la alineación
   */
  const playerAlreadySelected = () => {
    feedback.warning({
      message: 'Jugador ya seleccionado',
      caption: 'Este jugador ya está en tu alineación',
      icon: 'la la-info-circle',
      timeout: 2500,
    });
  };

  /**
   * Feedback para cuando la banca está llena
   */
  const benchFull = () => {
    feedback.warning({
      message: 'Banca completa',
      caption: 'No hay espacios disponibles en la banca',
      icon: 'la la-chair',
      timeout: 3000,
    });
  };

  /**
   * Feedback para cuando el campo está lleno
   */
  const fieldFull = () => {
    feedback.warning({
      message: 'Campo completo',
      caption: 'No hay espacios disponibles en el campo',
      icon: 'la la-users',
      timeout: 3000,
    });
  };

  /**
   * Feedback para cuando se comparte exitosamente
   */
  const shareSuccess = () => {
    feedback.success({
      message: 'Enlace copiado al portapapeles',
      icon: 'la la-share-alt',
      timeout: 2000,
    });
  };

  /**
   * Feedback para cuando falla compartir
   */
  const shareError = () => {
    feedback.error({
      message: 'No se pudo compartir',
      caption: 'Intenta nuevamente',
      timeout: 2500,
    });
  };

  /**
   * Feedback para cuando se restablece la alineación
   */
  const lineupReset = () => {
    feedback.info({
      message: 'Alineación restablecida',
      caption: 'Todos los cambios se han descartado',
      icon: 'la la-undo',
      timeout: 2500,
    });
  };

  /**
   * Feedback para cuando se reinicia completamente el campo y banquillo
   */
  const resetSuccess = () => {
    feedback.success({
      message: 'Campo y banquillo reiniciados',
      caption: 'Todos los jugadores han sido eliminados',
      icon: 'las la-redo-alt',
      timeout: 2500,
    });
  };

  /**
   * Feedback para validación: alineación incompleta
   */
  const incompleteLineup = () => {
    feedback.warning({
      message: 'Alineación incompleta',
      caption: 'Debes seleccionar todos los jugadores antes de guardar',
      icon: 'la la-exclamation-triangle',
      timeout: 3500,
    });
  };

  /**
   * Feedback genérico de éxito
   */
  const success = (message: string) => {
    feedback.success(message);
  };

  /**
   * Feedback genérico de error
   */
  const error = (message: string) => {
    feedback.error(message);
  };

  return {
    // Guardado
    saveSuccess,
    saveError,
    savingLineup,

    // Jugadores
    playerAdded,
    playerAddedToField,
    playerAddedToBench,
    playerMoved,
    playersSwapped,
    playerRemoved,
    playerUpdated,
    playerUpdateError,
    swapError,

    // Validaciones
    insufficientBudget,
    wrongPosition,
    playerAlreadySelected,
    benchFull,
    fieldFull,
    incompleteLineup,

    // Compartir
    shareSuccess,
    shareError,

    // Otras acciones
    lineupReset,
    resetSuccess,

    // Genéricos
    success,
    error,
  };
}
