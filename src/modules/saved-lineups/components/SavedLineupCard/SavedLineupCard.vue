<template>
  <q-card class="saved-lineup-card bg-SF-400 cursor-pointer" flat bordered>
    <q-card-section class="relative q-pa-md">
      <!-- Badge de estado flotante -->
      <q-badge
        v-if="lineup.isComplete"
        floating
        color="positive"
        label="Completa"
        class="text-xs"
      />
      <q-badge
        v-else
        floating
        color="warning"
        :label="`${lineup.fieldPlayersCount}/11`"
        class="text-xs"
      />

      <!-- Header: Nombre de la alineación -->
      <div class="text-h5 text-Extended-Text font-bold mb-3 line-clamp-1">{{ lineup.name }}</div>

      <!-- Información de equipo y coach -->
      <div class="q-mb-md space-y-1">
        <div v-if="lineup.teamName" class="flex items-center gap-2 text-Extended-Text">
          <q-icon name="la la-shield-alt" size="sm" color="primary" />
          <span class="text-body2 font-medium">{{ lineup.teamName }}</span>
        </div>
        <div v-if="lineup.coachName" class="flex items-center gap-2 text-Extended-Text">
          <q-icon name="la la-user-tie" size="sm" color="SF-700" />
          <span class="text-body2">{{ lineup.coachName }}</span>
        </div>
      </div>

      <!-- Stats Grid Compacto -->
      <div class="grid grid-cols-3 gap-2 q-mb-md">
        <!-- Campo -->
        <div class="bg-SF-200 rounded text-center q-pa-sm">
          <div class="text-h6 font-bold text-Extended-Text">{{ lineup.fieldPlayersCount }}/11</div>
          <div class="text-caption text-SF-700">Campo</div>
        </div>

        <!-- Banca -->
        <div class="bg-SF-200 rounded text-center q-pa-sm">
          <div class="text-h6 font-bold text-Extended-Text">
            {{ lineup.benchPlayersCount }}
          </div>
          <div class="text-caption text-SF-700">Banca</div>
        </div>

        <!-- Presupuesto -->
        <div class="bg-SF-200 rounded text-center q-pa-sm">
          <div class="text-h6 font-bold text-Extended-Text">{{ budgetPercentage }}%</div>
          <div class="text-caption text-SF-700">Usado</div>
        </div>
      </div>

      <!-- Meta info: Formación y fechas -->
      <div class="space-y-1">
        <!-- Formación -->
        <div class="flex items-center gap-2 text-caption text-SF-700">
          <q-icon name="la la-users" size="xs" />
          <span
            >Formación: <span class="font-medium">{{ lineup.formation }}</span></span
          >
        </div>

        <!-- Fecha de creación -->
        <div class="flex items-center gap-2 text-caption text-SF-700">
          <q-icon name="la la-calendar-plus" size="xs" />
          <span>Creada: {{ formattedCreatedAt }}</span>
        </div>

        <!-- Fecha de actualización -->
        <div class="flex items-center gap-2 text-caption text-SF-700">
          <q-icon name="la la-clock" size="xs" />
          <span>Actualizada: {{ formattedUpdatedAt }}</span>
        </div>
      </div>
    </q-card-section>

    <!-- Separator -->
    <q-separator />

    <!-- Acciones mejoradas -->
    <q-card-actions align="right" class="q-px-md q-py-sm">
      <q-btn
        flat
        dense
        no-caps
        round
        size="sm"
        color="negative"
        icon="la la-trash"
        @click.stop="emit('delete', lineup.id)"
      >
        <q-tooltip>Eliminar alineación</q-tooltip>
      </q-btn>

      <q-btn
        flat
        dense
        no-caps
        round
        size="sm"
        color="SF-700"
        icon="la la-copy"
        @click.stop="emit('duplicate', lineup.id)"
      >
        <q-tooltip>Crear una copia</q-tooltip>
      </q-btn>

      <q-btn
        unelevated
        no-caps
        size="sm"
        color="positive"
        label="Cargar"
        class="q-ml-xs"
        @click.stop="emit('load', lineup.id)"
      >
        <q-tooltip>Cargar alineación</q-tooltip>
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SavedLineupSummaryDto } from '../../dtos/saved-lineup.dto';

interface Props {
  lineup: SavedLineupSummaryDto;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  load: [lineupId: string];
  delete: [lineupId: string];
  duplicate: [lineupId: string];
}>();

/**
 * Porcentaje de presupuesto usado
 */
const budgetPercentage = computed(() => {
  if (props.lineup.totalBudget === 0) return 0;
  return Math.round((props.lineup.spentBudget / props.lineup.totalBudget) * 100);
});

/**
 * Fecha de creación formateada
 */
const formattedCreatedAt = computed(() => {
  return new Date(props.lineup.createdAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
});

/**
 * Fecha de actualización formateada (relativa)
 */
const formattedUpdatedAt = computed(() => {
  const date = new Date(props.lineup.updatedAt);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) {
    return 'Hace unos minutos';
  } else if (diffInHours < 24) {
    return `Hace ${diffInHours}h`;
  } else if (diffInHours < 48) {
    return 'Ayer';
  } else {
    return date.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
    });
  }
});
</script>

<style scoped lang="scss">
.saved-lineup-card {
  transition: all 0.3s ease;
  border: 1px solid var(--q-SF-300);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: var(--q-primary);
  }
}
</style>
