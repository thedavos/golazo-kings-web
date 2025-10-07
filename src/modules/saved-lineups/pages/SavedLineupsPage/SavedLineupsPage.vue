<template>
  <q-page class="border-SF-600 border-t-1 min-h-screen">
    <div class="mx-auto p-4 md:p-8">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-3xl font-bold text-Extended-Text">Mis Alineaciones</h1>
            <p class="text-SF-700 mt-1">
              {{ totalLineups }} alineaci{{ totalLineups !== 1 ? 'ones' : 'ón' }} guardada{{
                totalLineups !== 1 ? 's' : ''
              }}
            </p>
          </div>

          <q-btn
            unelevated
            no-caps
            color="primary"
            icon="la la-plus"
            label="Nueva Alineación"
            @click="handleCreateNew"
          />
        </div>

        <!-- Barra de búsqueda - Solo visible cuando hay suficientes alineaciones -->
        <q-input
          v-if="totalLineups >= 6"
          v-model="searchTerm"
          outlined
          dense
          name="searchTerm"
          placeholder="Buscar por nombre, formación o equipo..."
          bg-color="SF-100"
        >
          <template #prepend>
            <q-icon name="la la-search" />
          </template>
          <template #append>
            <q-icon
              v-if="searchTerm"
              name="la la-times"
              class="cursor-pointer"
              @click="searchTerm = ''"
            />
          </template>
        </q-input>
      </div>

      <!-- Estado vacío -->
      <div v-if="!hasLineups" class="text-center py-16">
        <q-icon name="la la-folder-open" size="80px" color="SF-600" class="mb-4" />
        <h3 class="text-xl font-semibold text-Extended-Text mb-2">
          No tienes alineaciones guardadas
        </h3>
        <p class="text-SF-700 mb-4">
          Crea tu primera alineación y guárdala para acceder a ella cuando quieras
        </p>
        <q-btn
          flat
          no-caps
          size="md"
          color="primary"
          icon="la la-plus"
          label="Crear Nueva Alineación"
          @click="handleCreateNew"
        />
      </div>

      <!-- Lista de alineaciones -->
      <div
        v-if="hasLineups && filteredLineups.length === 0 && searchTerm"
        class="text-center py-16"
      >
        <q-icon name="la la-search" size="60px" color="SF-600" class="mb-4" />
        <h3 class="text-xl font-semibold text-white mb-2">No se encontraron resultados</h3>
        <p class="text-SF-700">No hay alineaciones que coincidan con "{{ searchTerm }}"</p>
      </div>

      <div
        v-if="filteredLineups.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[calc(100vh-16rem)] pt-4 overflow-y-auto pr-2"
      >
        <saved-lineup-card
          v-for="lineup in filteredLineups"
          :key="lineup.id"
          :lineup="lineup"
          @load="handleLoadLineup"
          @delete="handleDeleteLineup"
          @duplicate="handleDuplicateLineup"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useSavedLineupsStore } from 'stores/useSavedLineupsStore';
import {
  useSavedLineupsFeedback,
  useSavedLineupsDialogs,
} from 'src/modules/saved-lineups/composables';
import { SavedLineupCard } from 'src/modules/saved-lineups/components/SavedLineupCard';

// Router y stores
const router = useRouter();
const savedLineupsStore = useSavedLineupsStore();

// Composables
const savedLineupsFeedback = useSavedLineupsFeedback();
const savedLineupsDialogs = useSavedLineupsDialogs();

// State reactivo del store
const { lineupsSortedByDate, totalLineups, hasLineups } = storeToRefs(savedLineupsStore);

// Estado local
const searchTerm = ref('');

/**
 * Alineaciones filtradas por búsqueda
 */
const filteredLineups = computed(() => {
  if (!searchTerm.value.trim()) {
    return lineupsSortedByDate.value;
  }
  return savedLineupsStore.searchLineups(searchTerm.value);
});

/**
 * Navega a home para crear nueva alineación
 */
const handleCreateNew = () => {
  void router.push({ name: 'home' });
};

/**
 * Carga una alineación y navega a home
 */
const handleLoadLineup = (lineupId: string) => {
  try {
    // Navegar a home con el ID de la alineación
    void router.push({
      name: 'home',
      query: { lineup: lineupId },
    });
  } catch (error) {
    console.error('Error al cargar alineación:', error);
    savedLineupsFeedback.lineupLoadError();
  }
};

/**
 * Elimina una alineación con confirmación usando dialog composable
 */
const handleDeleteLineup = (lineupId: string) => {
  const lineup = savedLineupsStore.getLineupById(lineupId);

  if (!lineup) {
    savedLineupsFeedback.lineupDeleteError();
    return;
  }

  savedLineupsDialogs.openDeleteConfirmDialog(lineup.name).onOk(() => {
    try {
      savedLineupsStore.deleteLineup(lineupId);
      savedLineupsFeedback.lineupDeleted(lineup.name);
    } catch (error) {
      console.error('Error al eliminar alineación:', error);
      savedLineupsFeedback.lineupDeleteError();
    }
  });
};

/**
 * Duplica una alineación existente
 */
const handleDuplicateLineup = (lineupId: string) => {
  const lineup = savedLineupsStore.getLineupById(lineupId);

  try {
    savedLineupsStore.duplicateLineup(lineupId);
    savedLineupsFeedback.lineupDuplicated(lineup?.name);
  } catch (error) {
    console.error('Error al duplicar alineación:', error);
    savedLineupsFeedback.lineupDuplicateError();
  }
};
</script>
