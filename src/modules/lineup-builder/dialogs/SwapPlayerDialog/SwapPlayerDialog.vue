<template>
  <q-dialog
    ref="dialogRef"
    transition-show="jump-up"
    transition-hide="jump-down"
    @hide="onDialogHide"
  >
    <q-card class="q-dialog-plugin" style="min-width: 400px; max-width: 500px">
      <go-toolbar-header title="Cambiar jugador" />

      <q-card-section class="pt-8">
        <div class="text-body2 text-grey-7 q-mb-md">
          Selecciona un jugador o posición vacía para intercambiar con
          <strong class="text-primary"
            >{{ currentPlayer?.firstName }} {{ currentPlayer?.lastName }}</strong
          >
        </div>

        <q-separator class="q-mb-md" />

        <!-- Lista de jugadores disponibles para intercambio -->
        <div
          v-if="availablePlayers.length > 0"
          class="q-gutter-sm"
          style="max-height: 400px; overflow-y: auto"
        >
          <q-card
            v-for="slot in availablePlayers"
            :key="slot.playerId ?? slot.id"
            flat
            bordered
            class="cursor-pointer transition-all"
            :class="{
              'bg-blue-1': hoveredSlotId === slot.id,
              'border-dashed': slot.playerId === null,
            }"
            @click="handleSwap(slot)"
            @mouseenter="hoveredSlotId = slot.id"
            @mouseleave="hoveredSlotId = null"
          >
            <q-card-section class="row items-center q-pa-sm">
              <!-- Foto del jugador o icono de slot vacío -->
              <q-avatar size="40px" class="q-mr-md" :color="slot.playerId ? undefined : 'grey-3'">
                <img
                  v-if="slot.playerId && getPlayerById(slot.playerId)?.profileImageUrl"
                  alt="Player"
                  class="object-contain"
                  :src="getPlayerById(slot.playerId)?.profileImageUrl ?? ''"
                />
                <q-icon
                  v-else-if="slot.playerId"
                  name="la la-user"
                  size="32px"
                  color="grey-6"
                />
                <q-icon v-else name="la la-plus-circle" size="32px" color="grey-5" />
              </q-avatar>

              <!-- Información del jugador o slot vacío -->
              <div class="col">
                <div class="text-subtitle2" :class="slot.playerId ? '' : 'text-grey-6'">
                  {{ slot.playerId ? slot.name : 'Posición vacía' }}
                </div>
                <div class="text-caption text-grey-7">
                  <q-badge
                    :label="slot.position || slot.name || 'N/A'"
                    :color="slot.playerId ? 'blue' : 'grey-5'"
                    outline
                    class="q-mr-xs"
                  />
                  <span v-if="slot.isBench">Banca</span>
                  <span v-else>Campo</span>
                  <span v-if="!slot.playerId" class="text-grey-5 q-ml-xs">(Disponible)</span>
                </div>
              </div>

              <!-- Icono de acción -->
              <q-icon name="la la-angle-right" color="grey-6" />
            </q-card-section>
          </q-card>
        </div>

        <!-- Mensaje si no hay jugadores disponibles -->
        <div v-else class="text-center q-pa-lg">
          <q-icon name="la la-info-circle" size="48px" color="grey-5" />
          <div class="text-body2 text-grey-7 q-mt-md">
            No hay jugadores disponibles para intercambiar
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn label="Cancelar" color="primary" no-caps flat @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { useLineupStore } from 'stores/useLineupStore';
import { GoToolbarHeader } from 'src/modules/shared/components/GoToolbarHeader';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';
import type { PlayerSlot } from 'src/modules/lineup-builder/types';

// ==================== TYPES ====================
interface Props {
  currentPlayer: PlayerDto | null | undefined;
  currentPlayerSlot: PlayerSlot | null | undefined;
  availableSlots: PlayerSlot[];
}

// ==================== PROPS & EMITS ====================

const props = defineProps<Props>();

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

// ==================== STORE ====================

const lineupStore = useLineupStore();

// ==================== STATE ====================

const hoveredSlotId = ref<string | null>(null);

// ==================== COMPUTED ====================

/**
 * Filtra los slots disponibles para intercambio:
 * - Incluye jugadores (excepto el actual)
 * - Incluye slots vacíos SOLO del campo (no de la banca)
 */
const availablePlayers = computed(() => {
  return props.availableSlots.filter((slot) => {
    // Excluir el jugador actual
    if (slot.playerId === props.currentPlayer?.id) {
      return false;
    }

    // Incluir jugadores (campo o banca con jugador)
    if (slot.playerId !== null) {
      return true;
    }

    // Incluir slots vacíos SOLO del campo (no de la banca)
    return !slot.isBench;
  });
});

// ==================== METHODS ====================

const getPlayerById = (playerId: number | null) => {
  return lineupStore.getLineupPlayerById(playerId);
};

const handleSwap = (slot: PlayerSlot) => {
  onDialogOK({ targetPlayerId: slot.playerId, targetSlotId: slot.id });
};
</script>

<style scoped>
.cursor-pointer:hover {
  transform: translateX(4px) scale(0.98);
}

.border-dashed {
  border-style: dashed !important;
  border-width: 2px !important;
}
</style>
