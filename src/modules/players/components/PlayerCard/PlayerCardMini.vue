<template>
  <div class="relative flex flex-col p-4 rounded-lg border border-blue bg-white gap-4">
    <!-- Botón de Edición -->
    <q-btn
      round
      flat
      dense
      size="sm"
      icon="la la-pen"
      class="!absolute top-2 right-2 p-2 text-Extended-Text"
      aria-label="Editar jugador"
      @click.stop="$emit('edit', player)"
    >
      <q-tooltip :delay="500">Editar jugador</q-tooltip>
    </q-btn>

    <!-- Sección superior: Foto + Datos -->
    <div class="flex gap-4 items-start">
      <!-- Foto del jugador -->
      <q-img
        fit="contain"
        position="center 5px"
        class="w-16 h-16 rounded-lg border overflow-hidden flex items-center justify-center select-none cursor-grabbing"
        :src="player.profileImageUrl || ''"
        :ratio="1"
        @dragstart="$emit('drag-start', player)"
      >
        <template #loading>
          <q-img
            src="src/assets/player/empty-player.png"
            fit="contain"
            class="w-full h-full opacity-50"
          />
        </template>
        <template #error>
          <q-img src="src/assets/player/empty-player.png" fit="contain" class="w-full h-full" />
        </template>
      </q-img>

      <!-- Info principal -->
      <div class="flex-1 flex flex-col gap-1">
        <div class="text-sm font-bold text-Extended-Text leading-tight">
          {{ name }}
        </div>
        <div class="flex items-center text-[11px] text-Extended-Text gap-2 flex-wrap">
          <span class="font-semibold">{{ player.positionAbbreviation || '-' }}</span>
          <span>-</span>
          <span class="font-semibold">{{ player.team || 'Sin equipo' }}</span>
          <!-- Logo/Avatar derivado del equipo (solo datos del player) -->
          <q-avatar
            v-if="player.teamLogo"
            rounded
            size="xs"
            color="transparent"
            class="font-semibold text-Extended-Text"
          >
            <q-img fit="contain" :src="player.teamLogo" />
          </q-avatar>
        </div>
        <div class="text-[11px] text-slate-400 mt-1">
          <span class="font-semibold text-Extended-Text">Salario: </span>
          <span class="text-Extended-Text font-bold">
            {{ player.marketValue ? '$' + player.marketValue.toLocaleString() : 'N/D' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Botón dinámico: Añadir o Manejar -->
    <div class="flex justify-end pt-1">
      <!-- Jugador NO está en alineación -->
      <q-btn-dropdown
        v-if="!playerStatus.inLineup"
        unelevated
        no-caps
        size="sm"
        color="primary"
        class="text-xs font-semibold"
        label="Añadir"
        icon="la la-plus"
        split
        dropdown-icon="la la-caret-down"
        @click="$emit('add-to-field', player)"
      >
        <q-list dense bordered class="text-xs">
          <q-item v-close-popup clickable @click="$emit('add-to-field', player)">
            <q-item-section>
              <q-item-label>Al campo</q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-close-popup clickable @click="$emit('add-to-bench', player)">
            <q-item-section>
              <q-item-label>A la banca</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>

      <!-- Jugador ESTÁ en alineación -->
      <q-btn-dropdown
        v-else
        unelevated
        no-caps
        size="sm"
        class="text-xs font-semibold"
        dropdown-icon="la la-caret-down"
        split
        :color="playerStatus.isBench ? 'orange' : 'green'"
        :label="playerStatus.isBench ? 'En banca' : 'En campo'"
        @click="$emit('remove-from-lineup', player)"
      >
        <q-list dense bordered class="text-xs">
          <!-- Opción para mover -->
          <q-item v-close-popup clickable @click="$emit('move-player', player)">
            <q-item-section>
              <q-item-label>
                {{ playerStatus.isBench ? 'Mover al campo' : 'Mover a la banca' }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-separator />

          <!-- Opción para remover -->
          <q-item v-close-popup clickable @click="$emit('remove-from-lineup', player)">
            <q-item-section>
              <q-item-label class="text-negative">Remover de alineación</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';
import { computed } from 'vue';

interface Props {
  player: PlayerDto;
  getPlayerStatus: (playerId: string | number) => {
    inLineup: boolean;
    isBench: boolean | null;
  };
}

const props = defineProps<Props>();

defineEmits([
  'edit',
  'drag-start',
  'add-to-field',
  'add-to-bench',
  'move-player',
  'remove-from-lineup',
]);

const name = computed(() => (props.player.firstName + ' ' + props.player.lastName).toUpperCase());

// Computed para obtener el estado del jugador
const playerStatus = computed(() => props.getPlayerStatus(props.player.id));
</script>
