<template>
  <div
    class="absolute bottom-[140px] right-[16px] w-[120px] bg-MC-400/70 border-2 border-MC-100 rounded-lg p-2.5 flex flex-col items-center gap-2.5 backdrop-blur-sm transition-all duration-300 z-10 hover:bg-MC-400/85 hover:-translate-y-0.5 hover:shadow-lg group cursor-pointer"
    @click="openCoachDialog"
  >
    <!-- Botón de remover (solo visible cuando hay entrenador Y en hover) -->
    <div
      v-if="lineupCoach"
      class="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 z-20 cursor-pointer"
      @click.stop="removeCoach"
    >
      <q-icon name="la la-times" size="14px" color="white" />
    </div>

    <!-- Imagen del entrenador -->
    <div class="relative w-[80px] h-[80px]">
      <div v-if="photoUrl" class="w-full h-full overflow-hidden">
        <q-img
          :src="photoUrl"
          :ratio="1"
          fit="contain"
          spinner-color="white"
          spinner-size="20px"
          class="w-full h-full"
        >
          <template #error>
            <div class="w-full h-full flex items-center justify-center bg-gray-500/50">
              <q-icon name="la la-user-tie" size="32px" color="white" />
            </div>
          </template>
        </q-img>
      </div>

      <!-- Placeholder si no hay imagen -->
      <div
        v-else
        class="w-full h-full rounded-full bg-gray-500/50 flex items-center justify-center border-2 border-white/50"
      >
        <q-icon name="la la-user-tie" size="32px" color="white" />
      </div>
    </div>

    <!-- Nombre del entrenador -->
    <div class="text-white text-xs font-bold text-center leading-tight break-words w-full">
      {{ coachName }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useLineupStore } from 'stores/useLineupStore';
import { useLineupDialogs } from 'src/modules/lineup-builder/composables/useLineupDialogs';
import { storeToRefs } from 'pinia';

const lineupStore = useLineupStore();
const { lineupCoach } = storeToRefs(lineupStore);
const { openCoachDialog } = useLineupDialogs();

const photoUrl = computed(() => lineupCoach.value?.photoUrl || null);
const coachName = computed(() => lineupCoach.value?.label || 'Entrenador');

/**
 * Remueve el entrenador seleccionado
 */
const removeCoach = () => {
  lineupStore.lineupCoach = null;
};
</script>
