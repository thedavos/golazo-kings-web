<template>
  <q-page>
    <lineup-builder-layout class="text-Extended-Text">
      <template #topbar>
        <lineup-toolbar class="border-SF-600 border-y-1">
          <template #left>
            <q-icon
              v-show="!lineupName"
              name="la la-pen"
              class="text-SF-600 cursor-pointer mr-1"
              size="1.2rem"
            />
            <q-input
              v-model="lineupName"
              name="lineup-name"
              placeholder="Nombre de la alineación"
              class="w-full"
              input-class="font-semibold"
              dense
              borderless
            />
          </template>

          <template #center>
            <lineup-budget />
          </template>

          <template #right>
            <lineup-toolbar-actions
              @save="handleSave"
              @share="openShareDialog"
              @settings="openSettingsDialog"
              @support="openSupportDialog"
              @feedback="openFeedbackDialog"
            />
          </template>
        </lineup-toolbar>
      </template>

      <template #main-area>
        <div class="field-3d-wrapper bg-Extended-Text">
          <soccer-field
            :players="demoPlayers"
            :enable3d="true"
            :team="teamInfo"
            :coach="coachInfo"
            @player-click="handlePlayerClick"
            @player-move="handlePlayerMove"
          />
        </div>
      </template>

      <template #sidebar>
        <div class="h-full bg-SF-200">
          <q-tabs
            v-model="sidebarTab"
            dense
            class="text-Extended-Text border-b border-gray-300 mx-4"
            active-color="primary"
            indicator-color="primary"
            align="justify"
          >
            <q-tab name="search" label="Buscar" no-caps />
            <q-tab name="summary" label="Resumen" no-caps />
          </q-tabs>

          <q-tab-panels v-model="sidebarTab" animated class="bg-transparent h-[calc(100%-48px)]">
            <q-tab-panel name="search" class="p-0 h-full">
              <lineup-sidebar />
            </q-tab-panel>

            <q-tab-panel name="summary" class="p-0 h-full">
              <lineup-summary />
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </template>

      <template #bottom-banner>
        <div>
          <ad-banner :closeable="true" height="small" />
        </div>
      </template>
    </lineup-builder-layout>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { LineupBuilderLayout } from 'src/modules/lineup-builder/layouts/LineupBuilderLayout';
import { LineupToolbar } from 'src/modules/lineup-builder/components/LineupToolbar';
import { LineupToolbarActions } from 'src/modules/lineup-builder/components/LineupToolbarActions';
import { LineupBudget } from 'src/modules/lineup-builder/components/LineupBudget';
import { LineupSidebar } from 'src/modules/lineup-builder/components/LineupSidebar';
import { LineupSummary } from 'src/modules/lineup-builder/components/LineupSummary';
import { SoccerField } from 'src/modules/lineup-builder/components/SoccerField';
import { useLineupDialogs } from 'src/modules/lineup-builder/composables/useLineupDialogs';
import { useLineupStore } from 'stores/useLineupStore';
import { useSavedLineupsStore } from 'stores/useSavedLineupsStore';
import { useLineupFeedback } from 'src/modules/lineup-builder/composables/useLineupFeedback';
import { useSavedLineupsFeedback } from 'src/modules/saved-lineups/composables/useSavedLineupsFeedback';
import { handleSaveLineup } from 'src/modules/lineup-builder/helpers';
import { AdBanner } from 'src/modules/ads/components';
// import { useSharedDemoBuilder } from 'src/modules/home/composables/useDemoBuilder';
// import { useSharedMainLayout } from 'src/modules/shared/composables/useMainLayout';
// import { HomeDemoBuilder } from 'src/modules/home/components/HomeDemoBuilder';
// import type { PlayerPositionAbbreviation } from 'src/modules/players/domain/value-objects/player-position.enum';

// Stores
const lineupStore = useLineupStore();
const savedLineupsStore = useSavedLineupsStore();

// Composables
const { openShareDialog, openSettingsDialog, openSupportDialog, openFeedbackDialog } =
  useLineupDialogs();
const lineupFeedback = useLineupFeedback();
const savedLineupsFeedback = useSavedLineupsFeedback();
const route = useRoute();
const router = useRouter();

const { lineupName } = storeToRefs(lineupStore);

// Estado del tab del sidebar
const sidebarTab = ref('search');

// Info del equipo
const teamInfo = ref({
  name: 'Golazo Kings FC',
  logo: '', // Puedes agregar una URL de logo aquí
});

// Info del entrenador
const coachInfo = ref({
  name: 'Pep Guardiola',
  image: '', // Puedes agregar una URL de imagen aquí
});

// Demo players para probar el campo (7 titulares + 5 suplentes)
const demoPlayers = ref([
  // CAMPO (7 jugadores)
  { id: '1', name: 'Portero', position: 'GK', x: 0.5, y: 0.66, isBench: false },
  { id: '2', name: 'Defensa 1', position: 'DF', x: 0.3, y: 0.6, isBench: false },
  { id: '3', name: 'Defensa 2', position: 'DF', x: 0.7, y: 0.6, isBench: false },
  { id: '4', name: 'Medio 1', position: 'MF', x: 0.35, y: 0.4, isBench: false },
  { id: '5', name: 'Medio 2', position: 'MF', x: 0.65, y: 0.4, isBench: false },
  { id: '6', name: 'Delantero 1', position: 'FW', x: 0.4, y: 0.2, isBench: false },
  { id: '7', name: 'Delantero 2', position: 'FW', x: 0.6, y: 0.2, isBench: false },

  // BANCA (5 suplentes) - distribuidos en la zona de la banca
  { id: '8', name: 'Suplente 1', position: 'SUB', x: 0.2, y: 0.95, isBench: true },
  { id: '9', name: 'Suplente 2', position: 'SUB', x: 0.35, y: 0.95, isBench: true },
  { id: '10', name: 'Suplente 3', position: 'SUB', x: 0.5, y: 0.95, isBench: true },
  { id: '11', name: 'Suplente 4', position: 'SUB', x: 0.65, y: 0.95, isBench: true },
  { id: '12', name: 'Suplente 5', position: 'SUB', x: 0.8, y: 0.95, isBench: true },
]);

const handlePlayerClick = (playerId: string) => {
  console.log('🎯 Jugador clickeado:', playerId);
  const player = demoPlayers.value.find((p) => p.id === playerId);
  if (player) {
    console.log('Jugador:', player);
  }
};

/**
 * Manejador de movimiento de jugador
 */
const handlePlayerMove = (playerId: string, x: number, y: number) => {
  const playerIndex = demoPlayers.value.findIndex((p) => p.id === playerId);
  if (playerIndex !== -1) {
    const player = demoPlayers.value[playerIndex];
    if (player) {
      player.x = x;
      player.y = y;
    }
  }
};

/**
 * Maneja el guardado de la alineación usando helper
 */
const handleSave = () => {
  handleSaveLineup({
    lineupStore,
    savedLineupsStore,
    lineupFeedback,
  });
};

/**
 * Restaura una alineación guardada desde query params
 */
const restoreLineupFromRoute = () => {
  const lineupId = route.query.lineup as string;

  if (lineupId) {
    try {
      const lineup = savedLineupsStore.getLineupById(lineupId);
      savedLineupsStore.loadLineup(lineupId);

      // Mostrar feedback de éxito
      if (lineup) {
        savedLineupsFeedback.lineupLoaded(lineup.name);
      }

      // Limpiar query params de la URL
      void router.replace({ query: {} });
    } catch (error) {
      console.error('Error al cargar alineación:', error);
      savedLineupsFeedback.lineupLoadError();
    }
  }
};

/**
 * Inicialización al montar el componente
 */
onMounted(() => {
  // Restaurar alineación si hay un ID en la URL
  void restoreLineupFromRoute();
});

// Composables
// const {
//   lineup,
//   bench,
//   selectedSlotId,
//   selectedSlotPosition,
//   selectedSlotType,
//   replaceLineup,
//   replaceBench,
// } = useSharedDemoBuilder();
// const { drawerLeft: layoutSearchDrawer } = useSharedMainLayout();

// const removeBenchPlayer = (slotId: string) => {
//   const newBench = { ...bench.value };
//   delete newBench[slotId];
//   replaceBench(newBench);
// };
//
// const removePlayer = (positionId: string) => {
//   const newLineup = { ...lineup.value };
//   delete newLineup[positionId];
//   replaceLineup(newLineup);
// };
//
// const openPlayerDialog = (slotId: string, position: PlayerPositionAbbreviation) => {
//   selectedSlotId.value = slotId;
//   selectedSlotPosition.value = position;
//   selectedSlotType.value = 'field';
//
//   if (layoutSearchDrawer.value === false) {
//     layoutSearchDrawer.value = true;
//   }
// };
//
// const openBenchDialog = (slotId: string) => {
//   selectedSlotId.value = slotId;
//   selectedSlotPosition.value = null;
//   selectedSlotType.value = 'bench';
//
//   if (layoutSearchDrawer.value === false) {
//     layoutSearchDrawer.value = true;
//   }
// };
</script>

<style lang="scss" scoped>
.field-3d-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
