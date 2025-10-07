import { useQuasar } from 'quasar';
import { SaveLineupDialog } from 'src/modules/lineup-builder/dialogs/SaveLineupDialog';
import { ShareLineupDialog } from 'src/modules/lineup-builder/dialogs/ShareLineupDialog';
import { SettingsLineupDialog } from 'src/modules/lineup-builder/dialogs/SettingsLineupDialog';
import { TeamLineupDialog } from 'src/modules/lineup-builder/dialogs/TeamLineupDialog';
import { SwapPlayerDialog } from 'src/modules/lineup-builder/dialogs/SwapPlayerDialog';
import { SupportApplicationDialog } from 'src/modules/shared/dialogs/SupportApplicationDialog';
import { SendFeedbackDialog } from 'src/modules/shared/dialogs/SendFeedbackDialog';
import { PlayerFormDialog } from 'src/modules/players/dialogs/PlayerFormDialog';
import { PlayerInformationDialog } from 'src/modules/players/dialogs/PlayerInformationDialog';
import { CoachLineupDialog } from 'src/modules/lineup-builder/dialogs/CoachLineupDialog';
import { useLineupFeedback } from './useLineupFeedback';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';
import type { PlayerSlot } from 'src/modules/lineup-builder/types';
import type { TeamSelectOption } from 'src/modules/lineup-builder/constants/team.constant';
import type { CoachSelectOption } from 'src/modules/lineup-builder/constants/coach.constant';

export function useLineupDialogs() {
  const $q = useQuasar();
  const lineupFeedback = useLineupFeedback();

  const openSaveDialog = () => {
    $q.dialog({
      component: SaveLineupDialog,
      // Pasa props al componente del diálogo si es necesario
      // componentProps: {
      //   someProp: 'value'
      // }
    }).onOk((payload) => {
      // Lógica a ejecutar cuando el diálogo se cierra con OK
      console.log('Guardar con nombre:', payload.name);
      lineupFeedback.saveSuccess(payload.name);
    });
  };

  const openSettingsDialog = () => {
    $q.dialog({
      component: SettingsLineupDialog,
    }).onOk((payload) => {
      console.log('Ajustes guardados:', payload);
      // Aquí puedes usar el payload para actualizar el estado de tu aplicación
    });
  };

  const openShareDialog = () => {
    $q.dialog({
      component: ShareLineupDialog,
    });
  };

  const openSupportDialog = () => {
    $q.dialog({
      component: SupportApplicationDialog,
    });
  };

  const openFeedbackDialog = () => {
    $q.dialog({
      component: SendFeedbackDialog,
    });
  };

  const openPlayerEditDialog = (player: PlayerDto) => {
    $q.dialog({
      component: PlayerFormDialog,
      componentProps: {
        player,
        mode: 'edit',
      },
    });
  };

  const openPlayerInformationDialog = (player: PlayerDto) => {
    $q.dialog({
      component: PlayerInformationDialog,
      componentProps: {
        player,
      },
    });
  };

  const openCoachDialog = () => {
    return $q
      .dialog({
        component: CoachLineupDialog,
      })
      .onOk((result: { type: string; coach: CoachSelectOption; photoUrl: string }) => {
        console.log('✅ Entrenador seleccionado:', result);
      })
      .onCancel(() => {
        console.log('❌ Dialog de entrenador cancelado');
      });
  };

  const openTeamDialog = () => {
    return $q
      .dialog({
        component: TeamLineupDialog,
      })
      .onOk((result: { type: string; team: TeamSelectOption; logo: string }) => {
        console.log('✅ Equipo seleccionado:', result);
      })
      .onCancel(() => {
        console.log('❌ Dialog cancelado');
      });
  };

  const openSwapPlayerDialog = (
    currentPlayer: PlayerDto | null | undefined,
    currentPlayerSlot: PlayerSlot | null | undefined,
    availableSlots: PlayerSlot[],
  ) => {
    return $q
      .dialog({
        component: SwapPlayerDialog,
        componentProps: {
          currentPlayer,
          currentPlayerSlot,
          availableSlots,
        },
      })
      .onOk((result: { targetPlayerId: number | null }) => {
        console.log('✅ Jugador seleccionado para intercambio:', result);
        return result;
      })
      .onCancel(() => {
        console.log('❌ Dialog de intercambio cancelado');
      });
  };

  return {
    openSaveDialog,
    openSettingsDialog,
    openShareDialog,
    openSupportDialog,
    openFeedbackDialog,
    openPlayerEditDialog,
    openPlayerInformationDialog,
    openCoachDialog,
    openTeamDialog,
    openSwapPlayerDialog,
  };
}
