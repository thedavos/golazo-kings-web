<template>
  <div class="h-full w-full p-4 overflow-hidden">
    <!-- Header -->
    <div class="mb-4">
      <h3 class="text-lg font-bold text-Extended-Text">Resumen de Alineación</h3>
      <p class="text-sm text-gray-600">
        {{ fieldPlayers.length }} jugadores en el campo • {{ benchPlayers.length }} en la banca
      </p>
    </div>

    <q-scroll-area class="h-full">
      <div class="pr-4 pb-8">
        <!-- Jugadores en el Campo -->
        <div v-if="fieldPlayers.length > 0" class="mb-6">
          <div class="flex items-center gap-2 mb-3">
            <h4 class="text-sm font-semibold text-Extended-Text uppercase">
              Campo ({{ fieldPlayers.length }})
            </h4>
          </div>

          <div class="space-y-3">
            <player-summary-card
              v-for="player in fieldPlayers"
              :key="player.id"
              :player="player"
              :is-bench="false"
              @view-details="handleViewDetails"
              @edit="handleEdit"
              @remove="handleRemove"
            />
          </div>
        </div>

        <!-- Jugadores en la Banca -->
        <div v-if="benchPlayers.length > 0" class="mb-6">
          <div class="flex items-center gap-2 mb-3">
            <h4 class="text-sm font-semibold text-Extended-Text uppercase">
              Banquillo ({{ benchPlayers.length }})
            </h4>
          </div>

          <div class="space-y-3">
            <player-summary-card
              v-for="player in benchPlayers"
              :key="player.id"
              :player="player"
              :is-bench="true"
              @view-details="handleViewDetails"
              @edit="handleEdit"
              @remove="handleRemove"
            />
          </div>
        </div>

        <!-- Estado vacío -->
        <div
          v-if="fieldPlayers.length === 0 && benchPlayers.length === 0"
          class="flex flex-col items-center justify-center py-12 px-4"
        >
          <q-icon name="la la-clipboard-list" size="xl" color="grey-5" class="mb-4" />
          <p class="text-text-default text-base font-medium mb-2">No hay jugadores</p>
          <p class="text-text-muted text-sm text-center max-w-[280px]">
            Agrega jugadores a tu alineación desde el buscador
          </p>
        </div>
      </div>
    </q-scroll-area>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useLineupStore } from 'stores/useLineupStore';
import { useLineupDialogs } from 'src/modules/lineup-builder/composables/useLineupDialogs';
import { useLineupFeedback } from 'src/modules/lineup-builder/composables/useLineupFeedback';
import PlayerSummaryCard from './PlayerSummaryCard.vue';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';

const lineupStore = useLineupStore();
const { fieldPlayersInSlots, benchPlayersInSlots } = storeToRefs(lineupStore);
const { openPlayerInformationDialog, openPlayerEditDialog } = useLineupDialogs();
const lineupFeedback = useLineupFeedback();

// Obtener jugadores del campo con sus datos completos
const fieldPlayers = computed(() => {
  return fieldPlayersInSlots.value
    .map((slot) => lineupStore.getLineupPlayerById(slot.playerId))
    .filter((player): player is PlayerDto => player !== null && player !== undefined);
});

// Obtener jugadores de la banca con sus datos completos
const benchPlayers = computed(() => {
  return benchPlayersInSlots.value
    .map((slot) => lineupStore.getLineupPlayerById(slot.playerId))
    .filter((player): player is PlayerDto => player !== null && player !== undefined);
});

// Handlers
const handleViewDetails = (player: PlayerDto) => {
  openPlayerInformationDialog(player);
};

const handleEdit = (player: PlayerDto) => {
  openPlayerEditDialog(player);
};

const handleRemove = (player: PlayerDto) => {
  const name = `${player.firstName} ${player.lastName}`.toUpperCase();
  lineupStore.removeLineupPlayer(player.id);
  lineupFeedback.playerRemoved(name);
};
</script>
