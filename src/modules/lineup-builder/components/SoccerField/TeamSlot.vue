<template>
  <div
    class="absolute top-[15px] left-[15px] w-[80px] h-[80px] rounded-lg bg-MC-400/70 border-2 border-MC-100 backdrop-blur-sm transition-all duration-300 z-10 hover:bg-MC-400/85 hover:border-MC-100 hover:-translate-y-0.5 hover:shadow-lg group cursor-pointer"
    @click="openTeamDialog"
  >
    <!-- Botón de remover (solo visible cuando hay equipo Y en hover) -->
    <div
      v-if="lineupTeam"
      class="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 z-20 cursor-pointer"
      @click.stop="removeTeam"
    >
      <q-icon name="la la-times" size="14px" color="white" />
    </div>

    <!-- Logo del equipo (desde store o icono por defecto) -->
    <div v-if="teamLogo" class="w-full h-full flex items-center justify-center relative">
      <q-img
        fit="cover"
        spinner-color="white"
        spinner-size="20px"
        class="w-full h-full"
        :ratio="1"
        :src="teamLogo"
      >
        <template #error>
          <div class="w-full h-full flex items-center justify-center bg-gray-500/50">
            <q-icon name="la la-shield-alt" size="32px" color="white" />
          </div>
        </template>
      </q-img>

      <!-- Overlay con icono de cambio (visible en hover) -->
      <div
        class="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <q-icon name="la la-edit" size="sm" color="white" />
      </div>
    </div>

    <!-- Icono placeholder si no hay equipo seleccionado -->
    <div v-else class="w-full h-full flex items-center justify-center">
      <div class="flex flex-col items-center gap-1">
        <q-icon name="la la-shield-alt" size="32px" color="white" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useLineupStore } from 'stores/useLineupStore';
import { useLineupDialogs } from 'src/modules/lineup-builder/composables/useLineupDialogs';
import { storeToRefs } from 'pinia';

const lineupStore = useLineupStore();
const { lineupTeam } = storeToRefs(lineupStore);
const { openTeamDialog } = useLineupDialogs();

// ==================== COMPUTED ====================

/**
 * Logo del equipo desde el store
 */
const teamLogo = computed(() => lineupTeam.value?.logo || null);

/**
 * Remueve el equipo seleccionado
 */
const removeTeam = () => {
  lineupStore.lineupTeam = null;
};
</script>
