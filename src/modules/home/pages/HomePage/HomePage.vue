<template>
  <q-page>
    <!--    <home-hero />-->
    <!--    <home-demo-builder-->
    <!--      :demo-players="demoPlayers"-->
    <!--      @update:lineup="updateLineup"-->
    <!--      @update:bench="updateBench"-->
    <!--      @remove:player="removePlayer"-->
    <!--      @remove:bench-player="removeBenchPlayer"-->
    <!--      @replace:lineup="replaceLineup"-->
    <!--      @replace:bench="replaceBench"-->
    <!--      @open-dialog:player="openPlayerDialog"-->
    <!--      @open-dialog:bench="openBenchDialog"-->
    <!--    />-->
  </q-page>
</template>

<script setup lang="ts">
// import { useSharedDemoBuilder } from 'src/modules/home/composables/useDemoBuilder';
// import { useSharedMainLayout } from 'src/modules/shared/composables/useMainLayout';
// import { HomeDemoBuilder } from 'src/modules/home/components/HomeDemoBuilder';
// import { HomeHero } from 'src/modules/home/components/HomeHero';
// import type { PlayerPositionAbbreviation } from 'src/modules/players/domain/value-objects/player-position.enum';

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
