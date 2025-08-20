<template>
  <q-card class="bg-slate-800/50 border border-blue-500/20 backdrop-blur-sm p-6">
    <h3 class="text-lg font-semibold text-white mb-3">Estado del Equipo</h3>

    <div class="space-y-2">
      <div class="flex justify-between">
        <span class="text-gray-400">Jugadores</span>
        <span class="text-white">{{ playersCount }}/{{ totalPositions }}</span>
      </div>

      <div class="flex justify-between">
        <span class="text-gray-400">Formación</span>
        <span class="text-blue-400">{{ selectedFormation }}</span>
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';
import type { FormationName } from 'src/modules/lineup-builder/components/LineupField';

interface Props {
  lineup: Record<string, PlayerDto>;
  selectedFormation: FormationName;
  totalPositions: number;
}

const props = withDefaults(defineProps<Props>(), {
  selectedFormation: '3-2-1',
  totalPositions: 7,
});

const playersCount = computed(() => {
  return Object.values(props.lineup).filter((player) => player !== null && player !== undefined)
    .length;
});
</script>
